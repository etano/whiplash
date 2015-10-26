#ifndef WDB_ENTITIES_ISING_HPP
#define WDB_ENTITIES_ISING_HPP

#include "generic.hpp"

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

#include "ising/model.hpp"
#include "ising/property.hpp"
#include "ising/executable.hpp"
#include "ising/controller.hpp"

#endif
