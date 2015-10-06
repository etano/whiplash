#ifndef WDB_ENTITIES_ISING_MODEL_HPP
#define WDB_ENTITIES_ISING_MODEL_HPP

#include <entities/generic/model.hpp>

namespace wdb { namespace entities { namespace ising {

    class model : public entities::model {
    public:
        using index_type = int64_t;                 ///< label the nodes
        using edge_type = std::pair<std::vector<index_type>, double>; ///< (nodes in the edge (>= 2), coupling value
        using node_type = std::vector<index_type>;  ///< lists of connecting edges for each node

        model(std::string owner, std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::ising>(), owner, in, parent, params), N_(0)
        {
            std::map<std::string,index_type> index;
            while(in){
                std::string input_str;
                if(!std::getline(in,input_str)) break;

                if(input_str.find(' ') != std::string::npos && input_str.find('#') == std::string::npos){
                    std::istringstream tmp0(input_str);
                    std::vector<std::string> input;
                    while(tmp0){
                        std::string s;
                        if(!std::getline(tmp0, s, ' '))
                            break;
                        input.push_back(s);
                    }

                    double val(std::stod(input[input.size()-1]));

                    std::vector<index_type> inds;
                    for(int i = 0; i < input.size()-1; ++i){
                        const std::string site(input[i]);
                        if(index.find(site) == index.end()) index[site] = N_++;
                        inds.push_back(index[site]);
                    }
                    // std::sort(inds.begin(), inds.end());
                    const std::set<index_type> inds_set(inds.begin(),inds.end());
                    inds.assign(inds_set.begin(),inds_set.end());
                    edges_.push_back(std::make_pair(inds, val));
                }
            }
            init_nodes();
        }

        model(const odb::iobject& o)
            : entities::model(o), N_(0)
        {
            for(auto e : reader::read<reader::array_type>(o, "cfg", "edges").unwrap()){
                std::vector<index_type> inds;
                auto sub_array = reader::read<reader::array_type>(e);
                for(const auto a : reader::read<reader::array_type>(sub_array[0])){
                    index_type a_ = reader::read<index_type>(a);
                    inds.push_back(a_);
                }

                double val = reader::read<double>(sub_array[1]);
                edges_.push_back(std::make_pair(inds, val));
            }
            N_ = reader::read<int>(o, "cfg", "n_spins");
            init_nodes();
        }

        virtual ~model() override {};

        virtual void serialize_cfg(odb::iobject& cfg) override {
            writer::prop("n_spins", N_) >> cfg;
            writer::prop("edges", edges_) >> cfg;
        }

        void init_nodes(){
            nodes_.resize(N_);
            for(int j = 0; j < edges_.size(); ++j)
                for(const auto a : edges_[j].first)
                    nodes_[a].push_back(j);
        }

        template<typename OtherSpinType>
        double total_energy(const std::vector<OtherSpinType>& variables) const {
            double E(0.0);
            for(const auto& edge : edges_){
                OtherSpinType tmp(0);
                for(const auto b : edge.first)
                    tmp ^= variables[b];
                E += (2*tmp-1) * edge.second * (2*OtherSpinType(edge.first.size()%2) - 1);
            }
            return E;
        }

        template<typename OtherSpinType>
        double delta_energy(const std::vector<OtherSpinType>& variables, const unsigned ind) const {
            double E(0.0);
            for(const auto a : nodes_[ind]){
                const auto& edge(edges_[a]);
                OtherSpinType tmp(0);
                for(const auto b : edge.first)
                    tmp ^= variables[b];

                E += (2*tmp-1) * edge.second * (2*OtherSpinType(edge.first.size()%2) - 1);
            }
            return -2.0*E;
        }

        virtual void print() override {
            for(auto i : edges_){
                std::cout << "{[ ";
                for(auto a : i.first) std::cout << a << " ";
                std::cout << "] " << i.second << "}  ";
            }
            std::cout << std::endl;
            std::cout << "num nodes: " << num_nodes() << "\n";
            std::cout << "num edges: " << num_edges() << "\n";
        }

        const int num_nodes() const {
            return N_;
        }

        const int num_edges() const {
            return edges_.size();
        }

        const std::vector<edge_type>& get_edges() const { return edges_; }

    private:
        std::vector<edge_type> edges_;
        std::vector<node_type> nodes_;
        int N_;
    };

} } }

#endif
