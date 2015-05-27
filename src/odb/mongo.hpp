#ifndef WDB_ODB_MONGO_HPP
#define WDB_ODB_MONGO_HPP

#include <mongocxx/client.hpp>
#include <mongocxx/options/find.hpp>
#include <mongocxx/exception/query.hpp>
#include <mongocxx/instance.hpp>

#include <bsoncxx/builder/basic/array.hpp>
#include <bsoncxx/builder/basic/document.hpp>
#include <bsoncxx/builder/basic/kvp.hpp>
#include <bsoncxx/types.hpp>
#include <bsoncxx/json.hpp>

#include "odb/mongo/object.h"
#include "odb/mongo/collection.h"
#include "odb/mongo/objectdb.h"
#include "odb/mongo/collection.hpp"
#include "odb/mongo/objectdb.hpp"
#include "odb/mongo/prop_reader.hpp"
#include "odb/mongo/prop_writer.hpp"

#endif
