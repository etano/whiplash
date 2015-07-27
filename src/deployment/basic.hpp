#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
      : db(db),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") ),
        executables( db.provide_collection("executables") )
    {}

    void basic::purge(){
        properties.purge();
        models.purge();
        executables.purge();
        db.reset_metadata();
    }

    void basic::insert_property(std::string model_class, int model_id, int executable_id, const std::vector<std::string>& params, std::string owner){
        std::shared_ptr<entities::generic::property> p(entities::factory::make_property(model_class,model_id,executable_id,params,entities::generic::property::status::UNDEFINED));
        object record, serialized_configuration;
        p->serialize_configuration(serialized_configuration);
        p->serialize(record, serialized_configuration);
        properties.insert(record, signature(db, "properties", owner));
    }

    void basic::insert_model(std::string file_name, std::string model_class, std::string owner){
        std::ifstream in(file_name);
        std::shared_ptr<entities::generic::model> m(entities::factory::make_model(model_class,in));
        in.close();
        object record, serialized_configuration;
        m->serialize_configuration(serialized_configuration);
        m->serialize(record, serialized_configuration);
        models.insert(record, signature(db, "models", owner));
    }

    void basic::insert_executable(std::string location, std::string model_class, std::string owner){
        object record;
        writer::prop("location", location) >> record;
        writer::prop("class", model_class) >> record;
        executables.insert(record, signature(db, "executables", owner)); // buggy
    }

    std::shared_ptr<entities::generic::model> basic::fetch_model(int id){
        return entities::factory::make_model(*models.find(id));
    }

    std::shared_ptr<rte::iexecutable> basic::fetch_executable(int id){
        return std::shared_ptr<rte::cluster::executable>( new rte::cluster::executable(reader::read<std::string>(*executables.find(id), "location")) );
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

    void basic::list_properties(){
        properties.list_objects();
    }

    void basic::list_model(int id){
        models.print_object(id);
    }

    template<typename... Args>
    std::vector<std::shared_ptr<odb::iobject>> basic::query(odb::iobject& o, const std::tuple<Args...>& target){
        for(auto &obj : properties.find_like(o)){
            signature signature_(*obj);
        
            std::shared_ptr<entities::generic::property> p(fetch_property(signature_.get_id()));
            if(std::isnan(reader::read<double>(*obj, target))){ // should use status instead
                entities::generic::controller::resolve(*fetch_executable(p->get_executable()),*fetch_model(p->get_model()),*p);
                object record, serialized_configuration;
                p->serialize_configuration(serialized_configuration);
                p->serialize(record, serialized_configuration);

                object filter; writer::prop("_id", signature_.get_id()) >> filter;
                properties.replace(filter, record, signature_);
            }
        }
        return properties.find_like(o);
    }

} }

#endif
