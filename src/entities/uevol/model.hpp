#ifndef WDB_ENTITIES_UEVOL_MODEL_HPP
#define WDB_ENTITIES_UEVOL_MODEL_HPP

#include <entities/generic/model.hpp>

#include <utils/optional.hpp>

#include <ifstream>

class parameters;

namespace wdb { namespace entities { namespace ising {
    class model : public entities::model{
        model(std::ifstream& in, optional<int> parent, optional<parameters> params)
            : entities::model(typename entities::info<ptype::ising>(), in, parent, params)
        {}
        
        virtual ~model() override {};
    }; // class model
} } }

#endif // WDB_ENTITIES_UEVOL_MODEL_HPP
