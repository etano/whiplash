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
        virtual std::vector<int> get_next_ids(std::string cname, int n_ids) override;
        virtual void reset_metadata() override;
    private:
        std::vector<icollection*> collections;
    };

} } }

#endif
