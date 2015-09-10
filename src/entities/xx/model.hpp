#ifndef WDB_ENTITIES_XX_MODEL_HPP
#define WDB_ENTITIES_XX_MODEL_HPP

#include <odb/interface/iobject.h>
#include <entities/generic/model.hpp>
#include <utils/optional.hpp>

#include <cassert>
#include <iosfwd>
#include <map>
#include <string>
#include <tuple>
#include <utility>
#include <vector>

class parameters;

namespace wdb { namespace entities { namespace xx {

    class model : public entities::model {
    public:
        using index_type = int;
        using bond_type = std::tuple<double, index_type, index_type, index_type>; ///< weight, node1, node2, color

        model(std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::xx>(), in, parent, params), N_(0)
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

        model(const odb::iobject& o)
            : entities::model(o), N_(0)
        {
            for(auto& e : reader::read<reader::array_type>(o, "cfg", "bonds").unwrap()){
                auto edge_data = reader::read<reader::array_type>(e);
//                edges.emplace_back(reader::read<edge>(edge_data));
                bonds_.emplace_back(std::make_tuple( reader::read<double>(edge_data[0])
                                                  , reader::read<index_type>(edge_data[1])
                                                  , reader::read<index_type>(edge_data[2])
                                                  , reader::read<index_type>(edge_data[3])));
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
            bond_type ret{0.0, -1, -1, -1};
            std::istringstream is(s);
            is >> std::get<1>(ret) >> std::get<2>(ret) >> std::get<0>(ret);
            is >> std::get<3>(ret);
            return ret;
        }
    };

} } }

#endif
