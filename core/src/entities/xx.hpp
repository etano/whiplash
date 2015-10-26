#ifndef WDB_ENTITIES_XX_HPP
#define WDB_ENTITIES_XX_HPP

#include "../odb/interface/iobject.h"
#include "generic.hpp"

namespace wdb { namespace entities {
    namespace xx {
        class model;
        class property;
        class executable;
        class controller;
    }
    template<>
    struct info<ptype::xx> {
        typedef xx::model associated_model_type;
        typedef xx::property associated_property_type;
        typedef xx::executable associated_executable_type;
        typedef xx::controller associated_controller_type;
        static constexpr char name[]= "xx";
    };
    constexpr char info<ptype::xx>::name[];
} }

#include "xx/model.hpp"
#include "xx/property.hpp"
#include "xx/executable.hpp"
#include "xx/controller.hpp"

#endif
