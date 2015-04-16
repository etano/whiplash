#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/oid.hpp>

#include <mongocxx/client.hpp>
#include <mongocxx/options/find.hpp>

namespace simfw {
  namespace Ising {

    using bsoncxx::builder::basic::document;

    class hamiltonian{

      typedef std::pair<std::vector<unsigned>, double> edge_type;
      typedef std::vector<unsigned> node_type;

    public:

      hamiltonian(const std::string& id)
      {
        mongocxx::client conn{mongocxx::uri("mongodb://cwave.ethz.ch:27017")};
        const auto db(conn["simfw"]);

        document filter{};
        filter << "_id" << id;

        const auto cursor(db["hamiltonians"].find(filter));

        N_ = 0;
        for(auto&& edge : cursor[1]){
        
          std::vector<unsigned> inds;
          for(const auto a : edge[0]){
            N_ = std::max(N_,a);
            inds.push_back(a);
          }
          const double val(edge[1]);

          edges_.push_back(std::make_pair(inds,val));
        }

        nodes_.resize(N_);
        for(unsigned j = 0; j < edges_.size(); ++j)
          for(const auto a : edges_[j].first)
            nodes_[a].push_back(j);
      }

      double total_energy(const std::vector<bool>& variables) const
      {
        double E(0.0);
        for(const auto& edge : edges_){

          bool tmp(0);
          for(const auto b : edge.first)
            tmp ^= variables[b];

          E += (2*tmp-1) * edge.second * (2*int(edge.first.size()%2) - 1);
        }

        return E;
      }

      double delta_energy(const std::vector<bool>& variables, const unsigned ind) const
      {
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
      std::size_t N_;
    };

  }
}

int main(int, char**)
{
  const std::string id("test");

  simfw::Ising::hamiltonian H(id);

  return 0;
}
