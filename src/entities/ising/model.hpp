#ifndef WDB_ENTITIES_ISING_MODEL_HPP
#define WDB_ENTITIES_ISING_MODEL_HPP

namespace wdb { namespace entities { namespace ising {

    class model : public wdb::entities::generic::model {
        typedef std::pair<std::vector<int>, double> edge_type;
        typedef std::vector<int> node_type;
    public:
        model(std::string model_class, std::ifstream& in)
            : wdb::entities::generic::model(model_class,in), N_(0)
        {
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

        model(std::string model_class, const odb::iobject& o)
            : wdb::entities::generic::model(model_class,o), N_(0)
        {
            for(auto e : reader::Array(o, "configuration", "edges")){
                std::vector<int> inds;
                auto sub_array = reader::Array(e);
                for(const auto a : reader::Array(sub_array[0])){
                    int a_ = reader::Int(a);
                    N_ = std::max(N_, a_);
                    inds.push_back(a_);
                }

                double val = reader::Double(sub_array[1]);
                edges_.push_back(std::make_pair(inds, val));
            }
            N_++; // important
            init_nodes();
        }

        virtual ~model() override {};

        virtual void serialize_configuration(odb::iobject& configuration) override {
            writer::prop("edges", edges_) >> configuration;
        }

        void init_nodes(){
            nodes_.resize(N_);
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

        virtual void print() override {
            for(auto i : edges_){
                std::cout << "{[ ";
                for(int a : i.first) std::cout << a << " ";
                std::cout << "] " << i.second << "}  ";
            }
            std::cout << std::endl;
            std::cout << "num nodes: " << num_nodes() << "\n";
            std::cout << "num edges: " << num_edges() << "\n";
        }

        int num_nodes(){
            return N_;
        }

        int num_edges(){
            return edges_.size();
        }

    private:
        std::vector<edge_type> edges_;
        std::vector<node_type> nodes_;
        int N_;
    };

} } }

#endif
