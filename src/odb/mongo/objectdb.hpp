#ifndef WDB_ODB_MONGO_OBJECTDB_HPP
#define WDB_ODB_MONGO_OBJECTDB_HPP

namespace wdb { namespace odb { namespace mongo {

    objectdb::objectdb(std::string url) :
        conn { mongocxx::uri("mongodb://"+url) },
        db( conn["wdb"] )
    {
    }

    objectdb::~objectdb(){
        for(auto c : collections) delete c;
    }

    icollection& objectdb::provide_collection(std::string name){
        collections.push_back(new collection(db[name]));
        return *collections.back();
    }

    int objectdb::get_next_id(std::string cname){
        using bsoncxx::builder::stream::document;
        using bsoncxx::builder::stream::open_document;
        using bsoncxx::builder::stream::close_document;
   
        document filter, update;
   
        filter << "_id" << cname;
        auto doc = db["counters"].find_one(filter);
        int res = detail::get<int>(*doc,"seq") + 1;
   
        update << "$set" << open_document << "seq" << res << close_document;
        db["counters"].update_one(filter, update);
   
        return res;
    }

} } }

#endif
