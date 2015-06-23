#ifndef WDB_ENTITIES_GENERIC_HPP
#define WDB_ENTITIES_GENERIC_HPP

namespace wdb { namespace entities {

    enum class resolution_state { UNDEFINED, PROCESSING, DEFINED };
    class reader : public wdb::odb::mongo::prop_reader {};
    class writer : public wdb::odb::mongo::prop_writer {};

} }

#include "entities/generic/model.hpp"
#include "entities/generic/property.hpp"
#include "entities/generic/controller.hpp"

#endif
