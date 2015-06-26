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
        object properties_counter, models_counter, executables_counter;
        counters.purge();

        writer::prop("_id", "properties") >> properties_counter;
        writer::prop("seq", -1) >> properties_counter;
        writer::prop("_id", "models") >> models_counter;
        writer::prop("seq", -1) >> models_counter;
        writer::prop("_id", "executables") >> executables_counter;
        writer::prop("seq", -1) >> executables_counter;

        counters.insert( properties_counter );
        counters.insert( models_counter );
        counters.insert( executables_counter );
    }

    void basic::insert_property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params){
        std::shared_ptr<entities::generic::property> p(entities::factory::make_property(model_class,model_id,executable_id,params,entities::generic::property::resolution_state::UNDEFINED));
        object record, serialized_configuration;
        p->serialize_configuration(serialized_configuration);
        p->serialize(record, serialized_configuration);
        db.sign(record, "properties");
        properties.insert(record);
    }

    void basic::insert_model(std::string file_name, std::string model_class){
        std::ifstream in(file_name);
        std::shared_ptr<entities::generic::model> m(entities::factory::make_model(model_class,in));
        in.close();
        object record, serialized_configuration;
        m->serialize_configuration(serialized_configuration);
        m->serialize(record, serialized_configuration);
        db.sign(record, "models");
        models.insert(record);
    }

    void basic::insert_executable(std::string file_name, std::string model_class){
        object record;
        writer::prop("file_name", file_name) >> record;
        writer::prop("class", model_class) >> record;
        db.sign(record, "executables");
        executables.insert(record); // buggy
    }

    std::shared_ptr<entities::generic::model> basic::fetch_model(int id){
        return entities::factory::make_model(*models.find(id));
    }

    std::shared_ptr<rte::iexecutable> basic::fetch_executable(int id){
        return std::shared_ptr<rte::cluster::executable>( new rte::cluster::executable(reader::read<std::string>(*executables.find(id), "file_name")) );
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
        object o;
        writer::prop("resolution_state", int(entities::generic::property::resolution_state::UNDEFINED)) >> o;
        for(auto &obj : properties.find_like(o)){
            int prop_id = reader::read<int>(*obj, "_id");
            resolve_property(prop_id);
        }
    }

    void basic::resolve_property(int id){
        std::shared_ptr<entities::generic::property> p(fetch_property(id));
        entities::generic::controller::resolve(*fetch_executable(p->get_executable()),*fetch_model(p->get_model()),*p);
        object record, serialized_configuration;
        p->serialize_configuration(serialized_configuration);
        p->serialize(record, serialized_configuration);
        object filter;
        writer::prop("_id", id) >> filter;
        properties.replace(filter,record);
    }

    void basic::list_properties(){
        properties.list_objects();
    }

    void basic::list_model(int id){
        models.print_object(id);
    }

    template<typename T>
    std::vector<std::shared_ptr<odb::iobject>> basic::query(odb::iobject& o, std::string target){
        for(auto &obj : properties.find_like(o)){
            int id = reader::read<int>(*obj, "_id");
            std::shared_ptr<entities::generic::property> p(fetch_property(id));
            if (std::isnan(reader::read<T>(*obj,"configuration",target))){
                entities::generic::controller::resolve(*fetch_executable(p->get_executable()),*fetch_model(p->get_model()),*p);
                object record, serialized_configuration;
                p->serialize_configuration(serialized_configuration);
                p->serialize(record, serialized_configuration);
                object filter;
                writer::prop("_id", id) >> filter;
                properties.replace(filter,record);
            }
        }
        return properties.find_like(o);
    }

} }

#endif
