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
        void resolve_property(int id);

        std::shared_ptr<rte::iexecutable> fetch_executable(int id);
        std::shared_ptr<entities::generic::model> fetch_model(int id);
        std::shared_ptr<entities::generic::property> fetch_property(int id);
        std::vector<std::shared_ptr<entities::generic::model>> fetch_models_like(odb::iobject& o);
        std::vector<std::shared_ptr<entities::generic::property>> fetch_properties_like(odb::iobject& o);
        std::vector<std::shared_ptr<odb::iobject>> query(odb::iobject& o);
    private:
        odb::icollection& properties;
        odb::icollection& models;
        odb::icollection& executables;
        odb::icollection& counters;
        odb::iobjectdb& db;
    };

} }

#endif
