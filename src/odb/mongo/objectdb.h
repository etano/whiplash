#ifndef WDB_ODB_MONGO_OBJECTDB_H
#define WDB_ODB_MONGO_OBJECTDB_H

namespace wdb { namespace odb { namespace mongo {

    using bsoncxx::builder::basic::document;
    using bsoncxx::builder::basic::kvp;
    using bsoncxx::builder::basic::sub_document;
    using bsoncxx::builder::basic::sub_array;

    class objectdb : public iobjectdb {
    public:
        mongocxx::instance inst;
        mongocxx::client conn;
        mongocxx::database db;

       ~objectdb() override;
        objectdb(std::string url);
        icollection& provide_collection(std::string name) override;
        int get_next_id(std::string collection) override;
        void sign(iobject& record, std::string cname) override;
    private:
        std::vector<icollection*> collections;
    };

} } }

#endif
