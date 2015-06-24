#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
      : db(db),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") ),
        executables( db.provide_collection("executables") ),
        counters( db.provide_collection("counters") )
    {}

    void basic::purge_collections(){
        properties.purge();
        models.purge();
        executables.purge();
        counters.purge();
    }

    void basic::reset_counters(){
        using odb::mongo::prop_writer;
        odb::mongo::object properties_counter, models_counter, executables_counter;
        counters.purge();

        prop_writer::prop("_id", "properties") >> properties_counter;
        prop_writer::prop("seq", -1) >> properties_counter;
        prop_writer::prop("_id", "models") >> models_counter;
        prop_writer::prop("seq", -1) >> models_counter;
        prop_writer::prop("_id", "executables") >> executables_counter;
        prop_writer::prop("seq", -1) >> executables_counter;

        counters.insert( properties_counter );
        counters.insert( models_counter );
        counters.insert( executables_counter );
    }

    void basic::insert_property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params){
        std::shared_ptr<entities::generic::property> p(entities::factory::make_property(model_class,model_id,executable_id,params,entities::generic::property::resolution_state::UNDEFINED));
        odb::mongo::object record, serialized_configuration;
        p->serialize_configuration(serialized_configuration);
        p->serialize(record, serialized_configuration);
        db.sign(record, "properties");
        properties.insert(record);
    }

    void basic::insert_model(std::string file_name, std::string model_class){
        std::ifstream in(file_name);
        std::shared_ptr<entities::generic::model> m(entities::factory::make_model(model_class,in));
        in.close();
        odb::mongo::object record, serialized_configuration;
        m->serialize_configuration(serialized_configuration);
        m->serialize(record, serialized_configuration);
        db.sign(record, "models");
        models.insert(record);
    }

    void basic::insert_executable(std::string file_name, std::string model_class){
        using odb::mongo::prop_writer;
        odb::mongo::object record;
        prop_writer::prop("file_name", file_name) >> record;
        prop_writer::prop("class", model_class) >> record;
        db.sign(record, "executables");
        executables.insert(record); // buggy
    }

    std::shared_ptr<entities::generic::model> basic::fetch_model(int id){
        return entities::factory::make_model(*models.find(id));
    }

    std::shared_ptr<rte::iexecutable> basic::fetch_executable(int id){
        return std::shared_ptr<rte::cluster::executable>( new rte::cluster::executable(entities::reader::String(*executables.find(id), "file_name")) );
    }

    std::shared_ptr<entities::generic::property> basic::fetch_property(int id){
        return entities::factory::make_property(*properties.find(id));
    }

    std::vector<std::shared_ptr<entities::generic::model>> basic::fetch_models_like(odb::iobject& o){
        std::vector<std::shared_ptr<entities::generic::model>> ms;
        for(auto &obj : models.find_like(o))
            ms.emplace_back(entities::factory::make_model(*obj));
        return ms;
    }

    std::vector<std::shared_ptr<entities::generic::property>> basic::fetch_properties_like(odb::iobject& o){
        std::vector<std::shared_ptr<entities::generic::property>> ps;
        for(auto &obj : properties.find_like(o))
            ps.emplace_back(entities::factory::make_property(*obj));
        return ps;
    }

    void basic::resolve_properties(){
        using odb::mongo::prop_writer;
        odb::mongo::object o;
        prop_writer::prop("resolution_state", int(entities::generic::property::resolution_state::UNDEFINED)) >> o;
        for(auto &obj : properties.find_like(o)){
            int prop_id = entities::reader::Int(*obj, "_id");
            resolve_property(prop_id);
        }
    }

    void basic::resolve_property(int id){
        using odb::mongo::prop_writer;
        std::shared_ptr<entities::generic::property> p(fetch_property(id));
        entities::generic::controller::resolve(*fetch_executable(p->get_executable()),*fetch_model(p->get_model()),*p);
        odb::mongo::object record, serialized_configuration;
        p->serialize_configuration(serialized_configuration);
        p->serialize(record, serialized_configuration);
        odb::mongo::object filter;
        prop_writer::prop("_id", id) >> filter;
        properties.replace(filter,record);
    }

    void basic::list_properties(){
        properties.list_objects();
    }

    void basic::list_model(int id){
        models.print_object(id);
    }

} }

#endif
