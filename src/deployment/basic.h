#ifndef WDB_DEPLOYMENT_BASIC_H
#define WDB_DEPLOYMENT_BASIC_H

namespace wdb { namespace deployment {

    class basic {
    public:
        basic(odb::iobjectdb& db);
        void purge();
        void insert_executable(std::string location, std::string model_class, std::string owner);
        void insert_model(std::string file_name, std::string model_class, std::string owner);
        void insert_property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params, std::string owner);
        void list_properties();
        void list_model(int id);

        std::shared_ptr<rte::iexecutable> fetch_executable(int id);
        std::shared_ptr<entities::generic::model> fetch_model(int id);
        std::shared_ptr<entities::generic::property> fetch_property(int id);
        std::vector<std::shared_ptr<entities::generic::model>> fetch_models_like(odb::iobject& o);
        std::vector<std::shared_ptr<entities::generic::property>> fetch_properties_like(odb::iobject& o);

        template<typename... Args>
        std::vector<std::shared_ptr<odb::iobject>> query(odb::iobject& o, const std::tuple<Args...>& target);

        using reader = wdb::odb::mongo::prop_reader;
        using writer = wdb::odb::mongo::prop_writer;
        using signature = wdb::odb::mongo::signature;
        using object = wdb::odb::mongo::object;
    private:
        odb::icollection& properties;
        odb::icollection& models;
        odb::icollection& executables;
        odb::iobjectdb& db;
    };

} }

#endif
