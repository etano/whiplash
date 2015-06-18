#ifndef WDB_DEPLOYMENT_BASIC_H
#define WDB_DEPLOYMENT_BASIC_H

namespace wdb { namespace deployment {

    class basic {
    public:
        basic(odb::iobjectdb& db);
        void purge_collections();
        void reset_counters();
        void insert_executable(std::string file_name, std::string model_class);
        void insert_model(std::string file_name, std::string model_class);
        void insert_property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params);
        void list_properties();
        void list_model(int id);
        void resolve_properties();
        void resolve_property(int prop_id);

        std::unique_ptr<entities::generic::property> assign_property_type(odb::iobject& o);
        std::unique_ptr<entities::generic::model> fetch_model(int id);
        rte::iexecutable& fetch_executable(int id);
        std::unique_ptr<entities::generic::property> fetch_property(int id);
        std::vector<std::unique_ptr<entities::generic::model>> fetch_models(odb::iobject& o);
        std::vector<std::unique_ptr<entities::generic::property>> fetch_properties(odb::iobject& o);

        rte::iexecutable& load(std::string app);
    private:
        odb::icollection& properties;
        odb::icollection& models;
        odb::icollection& executables;
        odb::icollection& counters;
        odb::iobjectdb& db;
    };

} }

#endif
