#ifndef WDB_ODB_MONGO_HPP
#define WDB_ODB_MONGO_HPP

#include <mongocxx/client.hpp>
#include <mongocxx/options/find.hpp>
#include <mongocxx/exception/query.hpp>
#include <mongocxx/exception/write.hpp>
#include <mongocxx/instance.hpp>

#include <bsoncxx/builder/basic/array.hpp>
#include <bsoncxx/builder/basic/document.hpp>
#include <bsoncxx/builder/basic/kvp.hpp>
#include <bsoncxx/types.hpp>
#include <bsoncxx/json.hpp>

#include "mongo/object.h"
#include "mongo/collection.h"
#include "mongo/signature.h"
#include "mongo/objectdb.h"
#include "mongo/prop_reader.hpp"
#include "mongo/prop_writer.hpp"
#include "mongo/collection.hpp"
#include "mongo/signature.hpp"
#include "mongo/objectdb.hpp"

#endif
