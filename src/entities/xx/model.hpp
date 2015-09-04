#ifndef WDB_ENTITIES_XX_MODEL_HPP
#define WDB_ENTITIES_XX_MODEL_HPP

namespace wdb { namespace entities { namespace xx {

    class model : public entities::model {
        typedef int64_t spin_type;
        typedef std::pair<std::vector<spin_type>, double> bond_type;
    public:
        model(std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::xx>(), in, parent, params), N_(0)
        {
            std::map<std::string,spin_type> index;
            while(in){
                std::string input_str;
                if(!std::getline(in,input_str)) break;

                if(input_str.find(' ') != std::string::npos && input_str.find('#') == std::string::npos){
                    std::istringstream tmp0(input_str);
                    std::vector<std::string> input;
                    while(tmp0){
                        std::string s;
                        if(!std::getline(tmp0, s, ' ')) break;
                        input.push_back(s);
                    }

                    double val(std::stod(input[input.size()-1]));

                    std::vector<spin_type> inds;
                    for(int i = 0; i < input.size()-1; ++i){
                        const std::string site(input[i]);
                        if(index.find(site) == index.end()) index[site] = N_++;
                        inds.push_back(index[site]);
                    }
                    std::sort(inds.begin(), inds.end(), std::less<spin_type>());
                    bonds_.push_back(std::make_pair(inds, val));
                }
            }
        }

        model(const odb::iobject& o)
            : entities::model(o), N_(0)
        {
            for(auto e : reader::read<reader::array_type>(o, "cfg", "bonds").unwrap()){
                std::vector<spin_type> inds;
                auto sub_array = reader::read<reader::array_type>(e);
                for(const auto a : reader::read<reader::array_type>(sub_array[0])){
                    spin_type a_ = reader::read<spin_type>(a);
                    inds.push_back(a_);
                }

                double val = reader::read<double>(sub_array[1]);
                bonds_.push_back(std::make_pair(inds, val));
            }
            N_ = reader::read<int>(o, "cfg", "n_spins");
        }

        virtual ~model() override {};

        virtual void serialize_cfg(odb::iobject& cfg) override {
            writer::prop("n_spins", N_) >> cfg;
            writer::prop("bonds", bonds_) >> cfg;
        }

        const int num_sites() const {
            return N_;
        }

        const int num_bonds() const {
            return bonds_.size();
        }

        const std::vector<bond_type>& get_bonds() const { return bonds_; }

    private:
        std::vector<double> couplings_;
        std::vector<bond_type> bonds_;
        std::vector<std::vector<int>> colorings_;
        int N_;
    };

} } }

#endif
