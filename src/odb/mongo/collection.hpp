#ifndef WDB_ODB_MONGO_COLLECTION_HPP
#define WDB_ODB_MONGO_COLLECTION_HPP

namespace wdb { namespace odb { namespace mongo {

    collection::collection(impl coll) : coll(std::move(coll))
    {
    }

    void collection::list_objects(){
        auto cursor = coll.find({});
        for(auto doc : cursor)
           std::cout << bsoncxx::to_json(doc) << std::endl;
    }

    void collection::print_object(int id){
        bsoncxx::builder::stream::document filter{};
        filter << "_id" << id;
        auto cursor = coll.find(filter);
        for(auto doc : cursor)
            std::cout << bsoncxx::to_json(doc) << std::endl;
    }

    std::unique_ptr<iobject> collection::find_object(int id){
        bsoncxx::builder::stream::document filter;
        filter << "_id" << id;
        return std::unique_ptr<iobject>(new object( *coll.find_one(filter) ));
    }

    std::unique_ptr<iobject> collection::find_object(iobject& o){
        return std::unique_ptr<iobject>(new object( *coll.find_one(static_cast<odb::mongo::object&>(o).w.builder) ));
    }

    std::vector<std::unique_ptr<iobject>> collection::find_objects(iobject& o){
        auto cursor = coll.find(static_cast<odb::mongo::object&>(o).w.builder);
        std::vector<std::unique_ptr<iobject>> docs;
        for(auto doc : cursor){
            odb::mongo::object* obj = new object(doc); // TODO: This is a workaround to keep the value data alive for the return of the vector
            docs.emplace_back(std::unique_ptr<iobject>(new object(obj->r.value)));
        }
        return docs;
    }

    void collection::insert(iobject& o){
        coll.insert_one(static_cast<odb::mongo::object&>(o).w.builder);
    }

    void collection::remove(iobject& o){
        coll.delete_one(static_cast<odb::mongo::object&>(o).w.builder);
    }

    void collection::purge(){
        try {
            coll.delete_many({});
        } catch (mongocxx::v0::exception::write e) {
            std::cerr << "Couldn't delete the collection's contents!" << std::endl;
        }
    }

} } }

#endif
