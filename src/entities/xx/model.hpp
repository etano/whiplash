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
        using edge = std::tuple<double, int, int, int>; ///< weight, node1, node2, color
        
        bool is_valid(const edge& e){
            const size_t nope = size_t(-1);
            return     std::get<1>(e) != std::get<2>(e) 
                    && std::get<1>(e) != nope 
                    && std::get<2>(e) != nope;
        }
        
        edge make_edge(const std::string& s){
            edge ret{0.0, -1, -1, -1};
            std::istringstream is(s);
            is >> std::get<1>(ret) >> std::get<2>(ret) >> std::get<0>(ret);
            is >> std::get<3>(ret);
            return ret;
        }
        
        typedef int64_t spin_type;
        typedef std::pair<std::vector<spin_type>, double> bond_type;
    public:
        model(std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::xx>(), in, parent, params), N_(0)
        {
            for(std::string l; getline(in, l);){
                if(l.find(' ') == std::string::npos || l.find('#') != std::string::npos){
                    continue;
                }
                edges.emplace_back(make_edge(l));
            }

            N_ = 0;
            for(const auto& e : edges){
                N_ = std::max(N_, std::max(std::get<1>(e), std::get<2>(e)));
            }
        }

        model(const odb::iobject& o)
            : entities::model(o), N_(0)
        {
//            for(auto e : reader::read<reader::array_type>(o, "cfg", "bonds").unwrap()){
//                std::vector<spin_type> inds;
//                auto sub_array = reader::read<reader::array_type>(e);
//                for(const auto a : reader::read<reader::array_type>(sub_array[0])){
//                    spin_type a_ = reader::read<spin_type>(a);
//                    inds.push_back(a_);
//                }

//                double val = reader::read<double>(sub_array[1]);
//                bonds_.push_back(std::make_pair(inds, val));
//            }
//            N_ = reader::read<int>(o, "cfg", "n_spins");
        }

        virtual ~model() override {};

        virtual void serialize_cfg(odb::iobject& cfg) override {
            writer::prop("n_spins", N_) >> cfg;
            writer::prop("bonds", edges) >> cfg;
        }

        const int num_spins() const {
            return N_;
        }

        const int num_bonds() const {
            return edges.size();
        }

        const std::vector<edge>& get_bonds() const { return edges; }

    private:
        std::vector<edge> edges;  ///< edges
        int N_;                   ///< number of nodes
    };

} } }

#endif
