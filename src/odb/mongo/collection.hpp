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

    std::vector<int> collection::insert_many(std::vector<std::shared_ptr<iobject>>& os, iobjectdb& db, std::string collection, std::string owner){
        std::vector<bsoncxx::builder::basic::document> docs;
        int n_docs = os.size();
        std::vector<int> ids = db.get_next_ids(collection,n_docs);
        for(int i=0; i<n_docs; i++){
            signature s(ids[i], owner);
            s.sign(*os[i]);
            docs.push_back(std::move(static_cast<odb::mongo::object&>(*os[i]).w.builder));
        }
        coll.insert_many(docs);
        return ids;
    }

    void collection::remove(iobject& o){
        coll.delete_one(static_cast<odb::mongo::object&>(o).w.builder);
    }

    void collection::update(iobject& o_old, iobject& o_new){
        coll.update_one(static_cast<odb::mongo::object&>(o_old).w.builder,static_cast<odb::mongo::object&>(o_new).w.builder);
    }

    void collection::replace(iobject& filter, iobject& o_new, const isignature& s){
        s.sign(o_new);
        coll.replace_one(static_cast<odb::mongo::object&>(filter).w.builder,static_cast<odb::mongo::object&>(o_new).w.builder);
    }

    void collection::replace(iobject& o_old, iobject& o_new){
        object filter;
        signature s(o_old);
        prop_writer::prop("_id", s.get_id()) >> filter;
        this->replace(filter, o_new, s);
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
