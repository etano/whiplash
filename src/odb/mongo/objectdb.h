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

        virtual ~objectdb() override;
        objectdb(std::string url);
        virtual icollection& provide_collection(std::string name) override;
        virtual int get_next_id(std::string collection) override;
        virtual void sign(iobject& record, std::string cname, std::string owner) override;
        virtual void sign(iobject& record, std::string owner, int timestamp) override;
    private:
        std::vector<icollection*> collections;
    };

} } }

#endif
