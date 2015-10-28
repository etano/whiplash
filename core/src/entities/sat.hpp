#ifndef WDB_ENTITIES_SAT_HPP
#define WDB_ENTITIES_SAT_HPP

namespace wdb { namespace entities {
    namespace sat {
        class model;
        class property;
        class executable;
        class controller;
    }
    template<>
    struct info<ptype::sat> {
        typedef sat::model associated_model_type;
        typedef sat::property associated_property_type;
        typedef sat::executable associated_executable_type;
        typedef sat::controller associated_controller_type;
        static constexpr char name[]= "sat";
    };
    constexpr char info<ptype::sat>::name[];
} }

#include "sat/model.hpp"
#include "sat/property.hpp"
#include "sat/executable.hpp"
#include "sat/controller.hpp"

#endif