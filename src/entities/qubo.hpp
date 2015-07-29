#ifndef WDB_ENTITIES_QUBO_HPP
#define WDB_ENTITIES_QUBO_HPP

namespace wdb { namespace entities {
    namespace qubo {
        class model;
        class property;
        class controller;
    }
    template<>
    struct info<ptype::qubo> {
        typedef qubo::model associated_model_type;
        typedef qubo::property associated_property_type;
        typedef qubo::controller associated_controller_type;
        static constexpr char name[]= "qubo";
    };
    constexpr char info<ptype::qubo>::name[];
} }

#include "entities/qubo/model.hpp"
#include "entities/qubo/property.hpp"
#include "entities/qubo/controller.hpp"

#endif
