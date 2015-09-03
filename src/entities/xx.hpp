#ifndef WDB_ENTITIES_XX_HPP
#define WDB_ENTITIES_XX_HPP

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

#include "entities/xx/model.hpp"
#include "entities/xx/property.hpp"
#include "entities/xx/executable.hpp"
#include "entities/xx/controller.hpp"

#endif
