#ifndef WDB_ENTITIES_XX_PROPERTY_HPP
#define WDB_ENTITIES_XX_PROPERTY_HPP

namespace wdb { namespace entities { namespace xx {

    class property : public entities::property {
        typedef int64_t index_type;
    public:
        property(const odb::iobject& o)
            : entities::property(o)
        {
            for(auto e : reader::read<reader::array_type>(o, "cfg", "loops").unwrap()){
                std::vector<index_type> inds;
                for(const auto a : reader::read<reader::array_type>(e)){
                    index_type a_ = reader::read<index_type>(a);
                    inds.push_back(a_);
                }
                loops_.push_back(inds);
            }
        }

        property(int model_id, int executable_id, optional<parameters> params, int seed, status s = status::UNDEFINED)
            : entities::property(typename entities::info<ptype::xx>(), model_id, executable_id, params, seed, s)
        {
            auto loops = this->get_param<std::string>("loops");
            if(loops){
                std::ifstream in(loops);
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
                
                        std::vector<index_type> inds;
                        for(int i = 0; i < input.size(); ++i)
                            inds.push_back(std::stoi(input[i])-1);
                        loops_.push_back(inds);
                    }
                }
            }
        }

        virtual ~property() override {};

        virtual void serialize_cfg(odb::iobject& cfg) override {
            if(loops_.size()) writer::prop("loops", loops_) >> cfg;
            if (status_ == status::UNDEFINED){
                writer::prop("costs", std::numeric_limits<double>::quiet_NaN()) >> cfg;
            } else if (status_ == status::DEFINED){
                writer::prop("costs", costs_) >> cfg;
            } else {
                throw std::runtime_error("Error: Property neither UNDEFINED nor DEFINED!\n");
            }
        }
    private:
        std::vector<std::vector<index_type>> loops_;
        std::vector<double> costs_;
    };

} } }

#endif
