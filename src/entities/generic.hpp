#ifndef WDB_ENTITIES_GENERIC_HPP
#define WDB_ENTITIES_GENERIC_HPP

namespace wdb { namespace entities {

    // TODO: Model, property, and controller should really be templated on the reader and writer type
    using reader = wdb::odb::mongo::prop_reader;
    using writer = wdb::odb::mongo::prop_writer;

    enum class etype { model,
                       property,
                       controller };

    enum class ptype {
        unknown, 
        ising,
        tsp,
        qubo,
        sat,
        LENGTH // 5
    };

} }

#include "entities/generic/model.hpp"
#include "entities/generic/property.hpp"
#include "entities/generic/controller.hpp"

#endif
