#ifndef SIMFW_ODB_MONGO_COLLECTION_HPP
#define SIMFW_ODB_MONGO_COLLECTION_HPP

namespace simfw { namespace odb { namespace mongo {

    collection::collection(impl&& coll) : coll(std::move(coll))
    {
    }

    void collection::list_objects(){
        auto cursor = coll.find({});
        for(auto&& doc : cursor)
           std::cout << bsoncxx::to_json(doc) << std::endl;
    }

    void collection::print_object(int id){
        bsoncxx::builder::stream::document filter{};
        filter << "_id" << id;
        auto cursor = coll.find(filter);
        for(auto&& doc : cursor)
            std::cout << bsoncxx::to_json(doc) << std::endl;
    }

    const object& collection::find_object(int id){
        bsoncxx::builder::stream::document filter;
        filter << "_id" << id;
        auto res = object( coll.find_one(filter)->view() );
        return res;
    }

    void collection::insert(iobject& o){
        /* todo */
    }

    void collection::insert(bsoncxx::builder::basic::document& o){
        coll.insert_one(o);
    }

} } }

#endif
