#ifndef WDB_ENTITIES_ISING_HPP
#define WDB_ENTITIES_ISING_HPP

#include <entities/generic.hpp>

namespace wdb { namespace entities { 
    namespace ising {
        class model;
        class property;
        class executable;
        class controller;
    }
    template<>
    struct info<ptype::ising> {
        typedef ising::model associated_model_type;
        typedef ising::property associated_property_type;
        typedef ising::executable associated_executable_type;
        typedef ising::controller associated_controller_type;
        static constexpr char name[]= "ising";
    };
    constexpr char info<ptype::ising>::name[];
} }

#include "entities/ising/model.hpp"
#include "entities/ising/property.hpp"
#include "entities/ising/executable.hpp"
#include "entities/ising/controller.hpp"

#endif
