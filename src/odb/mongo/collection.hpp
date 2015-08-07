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

    std::shared_ptr<iobject> collection::find(int id){
        bsoncxx::builder::stream::document filter;
        filter << "_id" << id;
        return std::shared_ptr<iobject>(new object( *coll.find_one(filter) ));
    }

    std::vector<std::shared_ptr<iobject>> collection::find_like(iobject& o){
        auto cursor = coll.find(static_cast<odb::mongo::object&>(o).w.builder);
        std::vector<std::shared_ptr<iobject>> docs;
        for(auto doc : cursor){
            docs.emplace_back(std::shared_ptr<iobject>(new object(doc)));
        }
        return docs;
    }

    int collection::insert(iobject& o, const isignature& s){
        s.sign(o);
        coll.insert_one(static_cast<odb::mongo::object&>(o).w.builder);
        return s.get_id();
    }

    int collection::insert_many(std::vector<std::shared_ptr<iobject>>& os, const isignature& s){
        mongocxx::bulk_write bw(0);
        for(auto& o : os){
            s.sign(*o);
            std::cout << "ji" << s.get_id() << std::endl;
            bw.append(mongocxx::model::insert_one(static_cast<odb::mongo::object&>(*o).w.builder));
            std::cout << s.get_id() << std::endl;
        }
        coll.bulk_write(bw);
        return 0;
    }

    void collection::remove(iobject& o){
        coll.delete_one(static_cast<odb::mongo::object&>(o).w.builder);
    }

    void collection::update(iobject& o_old, iobject& o_new){
        coll.update_one(static_cast<odb::mongo::object&>(o_old).w.builder,static_cast<odb::mongo::object&>(o_new).w.builder);
    }

    void collection::replace(iobject& o_old, iobject& o_new, const isignature& s){
        s.sign(o_new);
        coll.replace_one(static_cast<odb::mongo::object&>(o_old).w.builder,static_cast<odb::mongo::object&>(o_new).w.builder);
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
