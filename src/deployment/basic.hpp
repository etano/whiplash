#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
      : db(db),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") ),
        counters( db.provide_collection("counters") )
    {
    }

    void basic::purge_collections(){
        properties.purge();
        counters.purge();
        models.purge();
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

        static_cast<odb::mongo::collection&>(counters).insert( properties_counter );
        static_cast<odb::mongo::collection&>(counters).insert( models_counter );
        static_cast<odb::mongo::collection&>(counters).insert( executables_counter );
    }

    void basic::insert_property(int model_id, int executable_id, const std::vector<std::string>& params){
        std::string model_class = fetch_model(model_id)->get_class(); // please, optimize me
        std::string resolution_state = "not_started";
        std::unique_ptr<entities::generic::property> p(entities::property_registry(model_class,model_id,executable_id,params,resolution_state));
        odb::mongo::object record, serialized_state;
        p->serialize_state(serialized_state);
        p->serialize(record, serialized_state);
        db.sign(record, "properties");
        static_cast<odb::mongo::collection&>(properties).insert(record);
    }

    void basic::insert_model(std::string file_name, std::string model_class){
        std::ifstream in(file_name);
        std::unique_ptr<entities::generic::model> m(entities::model_registry(model_class,in));
        in.close();
        odb::mongo::object record;
        m->serialize(record);
        db.sign(record, "models");
        static_cast<odb::mongo::collection&>(models).insert(record);
    }

    void basic::insert_executable(...){
        // TODO
    }

    std::unique_ptr<entities::generic::model> basic::fetch_model(int id){
        return fetch_model(*models.find_object(id));
    }

    std::unique_ptr<entities::generic::property> basic::fetch_property(int id){
        return fetch_property(*properties.find_object(id));
    }

    std::unique_ptr<entities::generic::model> basic::fetch_model(odb::iobject& o){
        std::string model_class = entities::generic::reader::String(o, "class");
        return entities::model_registry(model_class,o);
    }

    std::unique_ptr<entities::generic::property> basic::fetch_property(odb::iobject& o){
        int model_id = entities::generic::reader::Int(o, "model_id");
        std::string model_class = fetch_model(model_id)->get_class();
        return entities::property_registry(model_class,o);
    }

    std::vector<std::unique_ptr<entities::generic::model>> basic::fetch_models(odb::iobject& o){
        std::vector<std::unique_ptr<entities::generic::model>> ms;
        for(auto &obj : models.find_objects(o))
            ms.emplace_back(fetch_model(*obj));
        return ms;
    }

    std::vector<std::unique_ptr<entities::generic::property>> basic::fetch_properties(odb::iobject& o){
        std::vector<std::unique_ptr<entities::generic::property>> ps;
        for(auto &obj : properties.find_objects(o))
            ps.emplace_back(fetch_property(*obj));
        return ps;
    }

    void basic::resolve_properties(){
        std::string key = "resolution_state";
        std::string val = "not_started";
        odb::mongo::object o;
        o.w.builder.append(std::make_tuple(key,val));
        for(auto &obj : properties.find_objects(o)){
            std::unique_ptr<entities::generic::property> p(fetch_property(*obj));
            p->resolve();

            odb::mongo::object filter;
            int prop_id = entities::generic::reader::Int(*obj, "_id");


            o.w.builder.append(std::make_tuple(std::string("_id"),prop_id));
            odb::mongo::object record, serialized_state;
            p->serialize_state(serialized_state);
            p->serialize(record, serialized_state);
            static_cast<odb::mongo::collection&>(properties).replace(filter,record);
        }
    }

    void basic::list_properties(){
        properties.list_objects();
    }

    void basic::list_model(int id){
        models.print_object(id);
    }

    rte::iexecutable& basic::load(std::string app){
        static rte::cluster::executable inst(app);
        return inst;
    }

} }

#endif
