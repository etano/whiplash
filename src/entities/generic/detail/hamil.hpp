#ifndef SIMFW_ENTITIES_GENERIC_DETAIL_HAMIL_HPP
#define SIMFW_ENTITIES_GENERIC_DETAIL_HAMIL_HPP

namespace simfw { namespace entities {

    using bsoncxx::builder::basic::document;

    class hamil {
        typedef std::pair<std::vector<unsigned>, double> edge_type;
        typedef std::vector<unsigned> node_type;
    public:
        hamil(const std::string& id) {
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
        size_t N_;
    };

} }

#endif
