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
        std::string model_class = fetch_model(model_id).get_class(); // please, optimize me
        std::unique_ptr<entities::generic::property> pb;
        std::string resolution_state = "not_started";
        if(model_class == "ising")
            pb = std::unique_ptr<entities::ising::property>(new entities::ising::property(model_id, executable_id, params, resolution_state));
        else
            pb = std::unique_ptr<entities::generic::property>(new entities::generic::property(model_id, executable_id, params, resolution_state));
        odb::mongo::object record, serialized_state;
        pb->serialize_state(serialized_state);
        pb->serialize(record, serialized_state);
        db.sign(record, "properties");
        static_cast<odb::mongo::collection&>(properties).insert(record);
    }

    void basic::insert_model(std::string file_name, std::string model_class){
        std::ifstream in(file_name);
        std::unique_ptr<entities::generic::model> m;
        if(model_class == "ising")
            m = std::unique_ptr<entities::ising::model>(new entities::ising::model(in));
        else
            m = std::unique_ptr<entities::generic::model>(new entities::generic::model(in));
        in.close();
        odb::mongo::object record;
        m->serialize(record);
        db.sign(record, "models");
        static_cast<odb::mongo::collection&>(models).insert(record);
    }

    void basic::insert_executable(...){
        // TODO
    }

    entities::generic::model basic::fetch_model(int id){
        return entities::generic::model( *models.find_object(id) );
    }

    entities::generic::property basic::fetch_property(int id){
        return entities::generic::property( *properties.find_object(id) );
    }

    entities::generic::model basic::fetch_model(odb::iobject& o){
        return entities::generic::model( *models.find_object(o) );
    }

    entities::generic::property basic::fetch_property(odb::iobject& o){
        return entities::generic::property( *properties.find_object(o) );
    }

    std::vector<entities::generic::model> basic::fetch_models(odb::iobject& o){
        std::vector<entities::generic::model> ms;
        for(auto &obj : models.find_objects(o))
            ms.emplace_back(entities::generic::model(*obj));
        return ms;
    }

    std::vector<entities::generic::property> basic::fetch_properties(odb::iobject& o){
        std::vector<entities::generic::property> ps;
        std::cout << "hello" << std::endl;
        int i = 0;
        for(auto &obj : properties.find_objects(o)) {
            std::cout << i << std::endl;
            ps.emplace_back(entities::generic::property(*obj));
            std::cout << i << std::endl;
            i++;
        }
        return ps;
    }

    std::vector<entities::generic::property> basic::fetch_unresolved_properties(){
        odb::mongo::object o;
        std::string key = "resolution_state";
        std::string val = "not_started";
        o.w.builder.append(std::make_tuple(key,val));
        std::cout << "hi" << std::endl;
        return fetch_properties(o);
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
