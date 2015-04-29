#ifndef SIMFW_ENTITIES_GENERIC_HAMIL_HPP
#define SIMFW_ENTITIES_GENERIC_HAMIL_HPP

namespace simfw { namespace entities { namespace generic {

    using simfw::odb::mongo::prop_reader;
    using simfw::odb::mongo::prop_writer;

    class hamil {
        typedef std::pair<std::vector<int>, double> edge_type;
        typedef std::vector<int> node_type;
    public:
        hamil(std::ifstream& in) : N_(0) {
            std::map<std::string,int> index;
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
            
                    std::vector<int> inds;
                    for(int i = 0; i < input.size()-1; ++i){
                        const std::string site(input[i]);
                        if(index.find(site) == index.end()) index[site] = N_++;
                        inds.push_back(index[site]);
                    }
                    std::sort(inds.begin(), inds.end(), std::less<int>());
                    edges_.push_back(std::make_pair(inds, val));
                }
            }
            init_nodes();
        }

        hamil(const odb::iobject& o) : N_(0) {
            const auto& obj = static_cast<const odb::mongo::object&>(o);
            for(auto e : prop_reader::Array(obj, "config")){
                std::vector<int> inds;
                auto sub_array = prop_reader::Array(e);
                for(const auto a : prop_reader::Array(sub_array[0])){
                    int a_ = prop_reader::Int(a);
                    N_ = std::max(N_, a_);
                    inds.push_back(a_);
                }

                double val = prop_reader::Double(sub_array[1]);
                edges_.push_back(std::make_pair(inds, val));
            }
            init_nodes();
        }

        void serialize(int id, odb::iobject& ham){
            prop_writer::prop("_id", id) >> ham;
            prop_writer::prop("config", edges_) >> ham;
        }

        void init_nodes(){
            nodes_.resize(N_+1);
            for(int j = 0; j < edges_.size(); ++j)
                for(const auto a : edges_[j].first)
                    nodes_[a].push_back(j);
        }

        double total_energy(const std::vector<bool>& variables) const {
            double E(0.0);
            for(const auto& edge : edges_){
                bool tmp(0);
                for(const auto b : edge.first)
                    tmp ^= variables[b];
                E += (2*tmp-1) * edge.second * (2*int(edge.first.size()%2) - 1);
            }
            return E;
        }
        double delta_energy(const std::vector<bool>& variables, const unsigned ind) const {
            double E(0.0);
            for(const auto a : nodes_[ind]){
                const auto& edge(edges_[a]);
                bool tmp(0);
                for(const auto b : edge.first)
                    tmp ^= variables[b];

                E += (2*tmp-1) * edge.second * (2*int(edge.first.size()%2) - 1);
            }
            return -2.0*E;
        }
    private:
        std::vector<edge_type> edges_;
        std::vector<node_type> nodes_;
        int N_;
    };

} } }

#endif
