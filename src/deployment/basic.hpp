#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
      : db(db),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") ),
        executables( db.provide_collection("executables") ),
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

        counters.insert( properties_counter );
        counters.insert( models_counter );
        counters.insert( executables_counter );
    }

    void basic::insert_property(int model_id, int executable_id, const std::vector<std::string>& params){
        std::string model_class = fetch_model(model_id)->get_class(); // please, optimize me
        std::unique_ptr<entities::generic::property> p(entities::factory::make_property(model_class,model_id,executable_id,params,entities::resolution_state::UNDEFINED));
        odb::mongo::object record, serialized_configuration;
        p->serialize_configuration(serialized_configuration);
        p->serialize(record, serialized_configuration);
        db.sign(record, "properties");
        properties.insert(record);
    }

    void basic::insert_model(std::string file_name, std::string model_class){
        std::ifstream in(file_name);
        std::unique_ptr<entities::generic::model> m(entities::factory::make_model(model_class,in));
        in.close();
        odb::mongo::object record;
        m->serialize(record);
        db.sign(record, "models");
        models.insert(record);
    }

    void basic::insert_executable(std::string file_name, std::string model_class){
        odb::mongo::object record;
        record.w.builder.append(std::make_tuple(std::string("file_name"),file_name));
        record.w.builder.append(std::make_tuple(std::string("class"),model_class));
        db.sign(record, "executables");
        executables.insert(record); // FIXME: This is currently broken
    }

    std::unique_ptr<entities::generic::property> basic::assign_property_type(odb::iobject& o){ // I have to be on a factory T_T
        int model_id = entities::generic::reader::Int(o, "model_id");
        std::string model_class = fetch_model(model_id)->get_class(); // that's broken (prop should have model_class_id to avoid this)
        return entities::factory::make_property(model_class,o);
    }

    std::unique_ptr<entities::generic::model> basic::fetch_model(int id){
        return entities::factory::make_model(*models.find(id));
    }

    std::unique_ptr<entities::generic::property> basic::fetch_property(int id){
        return assign_property_type(*properties.find(id));
    }

    std::vector<std::unique_ptr<entities::generic::model>> basic::fetch_models(odb::iobject& o){
        std::vector<std::unique_ptr<entities::generic::model>> ms;
        for(auto &obj : models.find_like(o))
            ms.emplace_back(entities::factory::make_model(*obj));
        return ms;
    }

    std::vector<std::unique_ptr<entities::generic::property>> basic::fetch_properties(odb::iobject& o){
        std::vector<std::unique_ptr<entities::generic::property>> ps;
        for(auto &obj : properties.find_like(o))
            ps.emplace_back(assign_property_type(*obj));
        return ps;
    }

    void basic::resolve_properties(){
        odb::mongo::object o;
        o.w.builder.append(std::make_tuple(std::string("resolution_state"),int(entities::resolution_state::UNDEFINED)));
        for(auto &obj : properties.find_like(o)){
            std::unique_ptr<entities::generic::property> p(assign_property_type(*obj));
            p->resolve();

            odb::mongo::object filter;
            int prop_id = entities::generic::reader::Int(*obj, "_id");
            filter.w.builder.append(std::make_tuple(std::string("_id"),prop_id));
            odb::mongo::object record, serialized_configuration;
            p->serialize_configuration(serialized_configuration);
            p->serialize(record, serialized_configuration);
            properties.replace(filter,record);
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
