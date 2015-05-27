#ifndef WDB_DEPLOYMENT_BASIC_H
#define WDB_DEPLOYMENT_BASIC_H

namespace wdb { namespace deployment {

    class basic {
    public:
        basic(odb::iobjectdb& db);
        void resolve_property();
        void assume_property(int hid, std::string solver, const std::vector<std::string>& params);
        void drop_collections();
        void init_counters();
        void insert_model(std::ifstream&, const std::vector<std::pair<std::string,std::string> >&);
        void list_properties();
        void list_model(int id);

        entities::generic::model fetch_model(int id);
        entities::generic::property fetch_property(int id);

        rte::iexecutable& load(std::string app);
    private:
        odb::icollection& properties;
        odb::icollection& models;
        odb::icollection& counters;
        odb::iobjectdb& db;
    };

} }

#endif
