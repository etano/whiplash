#ifndef SIMFW_ODB_MONGO_TRIGGERS_HPP
#define SIMFW_ODB_MONGO_TRIGGERS_HPP

namespace simfw { namespace odb { namespace mongo { namespace triggers {

    using bsoncxx::builder::stream::document;
    using bsoncxx::builder::stream::open_document;
    using bsoncxx::builder::stream::close_document;
   
    template<typename DB>
    int get_next_sequence(DB& db, std::string name){
        document filter, update;
   
        filter << "_id" << name;
        auto doc = db["counters"].find_one(filter);
        int res = std::stoi(bsoncxx::to_json(doc->view()["seq"].get_value())) + 1;
   
        update << "$set" << open_document << "seq" << res << close_document;
        db["counters"].update_one(filter, update);
   
        return res;
    }

} } } }

#endif
