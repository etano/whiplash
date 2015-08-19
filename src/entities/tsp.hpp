#ifndef WDB_ENTITIES_TSP_HPP
#define WDB_ENTITIES_TSP_HPP

namespace wdb { namespace entities {
    namespace tsp {
        class model;
        class property;
        class executable;
        class controller;
    }
    template<>
    struct info<ptype::tsp> {
        typedef tsp::model associated_model_type;
        typedef tsp::property associated_property_type;
        typedef tsp::executable associated_executable_type;
        typedef tsp::controller associated_controller_type;
        static constexpr char name[]= "tsp";
    };
    constexpr char info<ptype::tsp>::name[];
} }

#include "entities/tsp/model.hpp"
#include "entities/tsp/property.hpp"
#include "entities/tsp/executable.hpp"
#include "entities/tsp/controller.hpp"

#endif
