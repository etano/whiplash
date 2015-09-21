#ifndef WDB_ENTITIES_UEVOL_MODEL_HPP
#define WDB_ENTITIES_UEVOL_MODEL_HPP

#include <entities/generic/model.hpp>

#include <utils/optional.hpp>

#include <fstream>

class parameters;

namespace wdb { namespace entities { namespace uevol {
    class model : public entities::model{
    public:
        using index_type = int;
        using bond_type = std::tuple<double, index_type, index_type>; ///< weight, node1, node2
        
        /// initialize model from filestream and optional parameters
        model(std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::ising>(), in, parent, params)
        {
            for(std::string l; getline(in, l);){
                if(l.find(' ') == std::string::npos || l.find('#') != std::string::npos){
                    continue;
                }
                bonds_.emplace_back(make_edge(l));
            }

            N_ = 0;
            for(const auto& e : bonds_){
                N_ = std::max(N_, std::max(std::get<1>(e), std::get<2>(e)));
            }
        }
        
        /// initialize model from the database
        model(const odb::iobject& o)
            : entities::model(o), N_(0)
        {
            for(auto& e : reader::read<reader::array_type>(o, "cfg", "bonds").unwrap()){
                auto edge_data = reader::read<reader::array_type>(e);
                bonds_.emplace_back(std::make_tuple( reader::read<double>(edge_data[0])
                                                   , reader::read<index_type>(edge_data[1])
                                                   , reader::read<index_type>(edge_data[2])));
            }
            N_ = reader::read<index_type>(o, "cfg", "n_spins");
        }
        
        virtual ~model() override {};
        
        virtual void serialize_cfg(odb::iobject& cfg) override {
            writer::prop("n_spins", N_) >> cfg;
            writer::prop("bonds", bonds_) >> cfg;
        }

        const index_type num_spins() const {
            return N_;
        }

        const size_t num_bonds() const {
            return bonds_.size();
        }

        const std::vector<bond_type>& get_bonds() const { return bonds_; }
        
    private: // data
        std::vector<bond_type> bonds_;  ///< edges
        index_type N_;                  ///< number of nodes

    private: // helpers

        bool is_valid(const bond_type& e){
            const index_type nope = index_type(-1);
            return     std::get<1>(e) != std::get<2>(e) 
                    && std::get<1>(e) != nope 
                    && std::get<2>(e) != nope;
        }
        
        bond_type make_edge(const std::string& s){
            bond_type ret{0.0, -1, -1};
            std::istringstream is(s);
            is >> std::get<0>(ret) >> std::get<1>(ret) >> std::get<2>(ret);
            return ret;
        }        
    }; // class model
} } }

#endif // WDB_ENTITIES_UEVOL_MODEL_HPP
