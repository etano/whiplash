#ifndef WDB_ENTITIES_UEVOL_PROPERTY_HPP
#define WDB_ENTITIES_UEVOL_PROPERTY_HPP

#include <entities/generic/property.hpp>

namespace wdb { namespace entities { namespace ising {
    class property : public entities::property {
        property(const odb::iobject& o)
            : entities::property(o)
        {}
    };
    
} } }

#endif // WDB_ENTITIES_UEVOL_PROPERTY_HPP
