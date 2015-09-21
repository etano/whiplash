#ifndef WDB_ENTITIES_UEVOL_PROPERTY_HPP
#define WDB_ENTITIES_UEVOL_PROPERTY_HPP

#include <entities/generic/property.hpp>

namespace wdb { namespace entities { namespace uevol {
    
    class property : public entities::property {
        property(const odb::iobject& o)
            : entities::property(o)
        {}
        
    }; // class property
    
} } }

#endif // WDB_ENTITIES_UEVOL_PROPERTY_HPP
