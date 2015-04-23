#ifndef SIMFW_ENTITIES_GENERIC_HAMIL_HPP
#define SIMFW_ENTITIES_GENERIC_HAMIL_HPP

namespace simfw { namespace entities { namespace generic {

    using bsoncxx::builder::basic::document;
    using simfw::odb::mongo::prop_reader;

    class hamil {
        typedef std::pair<std::vector<int>, double> edge_type;
        typedef std::vector<int> node_type;
    public:
        hamil(const simfw::odb::mongo::object& obj) : N_(0) {

            std::vector<edge_type> edges_; // fix me (memory errors)
            std::vector<node_type> nodes_;

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
