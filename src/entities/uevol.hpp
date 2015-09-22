#ifndef WDB_ENTITIES_UEVOL_HPP
#define WDB_ENTITIES_UEVOL_HPP

namespace wdb { namespace entities { 
    namespace uevol {
        class model;
        class property;
        class executable;
        class controller;
    }

    template<>
    struct info<ptype::uevol> {
        typedef uevol::model associated_model_type;
        typedef uevol::property associated_property_type;
        typedef uevol::executable associated_executable_type;
        typedef uevol::controller associated_controller_type;
        static constexpr char name[]= "uevol";
    };
    constexpr char info<ptype::uevol>::name[];
} }

#include "entities/uevol/model.hpp"
#include "entities/uevol/property.hpp"
#include "entities/uevol/executable.hpp"
#include "entities/uevol/controller.hpp"

#endif

