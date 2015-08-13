#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
      : db(db),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") ),
        executables( db.provide_collection("executables") ),
        rng( wdb::timer::now() )
    {}

    void basic::format(){
        properties.purge();
        models.purge();
        executables.purge();
        db.reset_metadata();
    }

    int basic::insert_property(std::string problem_class, std::string owner, int model_id, int executable_id, optional<params_type> params){
        std::vector<int> model_ids{model_id};
        int reps = 1;
        return insert_properties(problem_class, owner, model_ids, executable_id, params, reps)[0];
    }

    std::vector<int> basic::insert_properties(std::string problem_class, std::string owner, const std::vector<int>& model_ids, int executable_id, optional<params_type> params, int reps){
        std::vector<std::shared_ptr<odb::iobject>> records;
        for(auto& model_id : model_ids)
            for(int i=0; i<reps; i++) {
                std::shared_ptr<entities::property> p(entities::factory::make_entity<e::property>(problem_class, model_id, executable_id, params, random_seed()));
                object serialized_cfg;
                p->serialize_cfg(serialized_cfg);
                records.emplace_back(std::make_shared<object>());
                p->serialize(*records.back(), serialized_cfg);
            }
        return properties.insert_many(records, db, "properties", owner);
    }

    int basic::insert_model(std::string problem_class, std::string owner, std::string path, optional<int> parent_id, optional<params_type> params){
        std::vector<std::string> paths{path};
        return insert_models(problem_class, owner, paths, parent_id, params)[0];
    }

    std::vector<int> basic::insert_models(std::string problem_class, std::string owner, const std::vector<std::string>& paths, optional<int> parent_id, optional<params_type> params){
        std::vector<std::shared_ptr<odb::iobject>> records;
        for(auto& path : paths){
            std::ifstream in(path);
            std::shared_ptr<entities::model> m(entities::factory::make_entity<e::model>(problem_class, in, parent_id, params));
            in.close();
            object record, serialized_cfg;
            m->serialize_cfg(serialized_cfg);
            records.emplace_back(std::make_shared<object>());
            m->serialize(*records.back(), serialized_cfg);
        }
        return models.insert_many(records, db, "models", owner);
    }

    int basic::insert_executable(std::string problem_class, std::string owner, std::string path, std::string description, std::string algorithm, std::string version, std::string build_info, optional<params_type> params)
    {
        // TODO: is there a reason this isn't also done the same way model and property are done?
        object record;

        // Required arguments
        writer::prop("path", path) >> record;
        writer::prop("class", problem_class) >> record;
        writer::prop("description", description) >> record;
        writer::prop("algorithm", algorithm) >> record;
        writer::prop("version", version) >> record;
        writer::prop("build_info", build_info) >> record;

        // Optional arguments
        if (params)
            if (params.unwrap().get_container())
                writer::prop("cfg", params) >> record;

        // Sign and insert
        return executables.insert(record, signature(db, "executables", owner)); // TODO: buggy
    }

    std::shared_ptr<entities::model> basic::fetch_model(int id){
        return entities::factory::make_entity<e::model>(*models.find(id));
    }

    std::shared_ptr<rte::iexecutable> basic::fetch_executable(int id){
        return std::shared_ptr<rte::executable>( new rte::executable(reader::read<std::string>(*executables.find(id), "path")) );
    }

    std::shared_ptr<entities::property> basic::fetch_property(int id){
        return entities::factory::make_entity<e::property>(*properties.find(id));
    }

    std::vector<std::shared_ptr<entities::model>> basic::fetch_models_like(odb::iobject& o){
        std::vector<std::shared_ptr<entities::model>> ms;
        for(auto &obj : models.find_like(o))
            ms.emplace_back(entities::factory::make_entity<e::model>(*obj));
        return ms;
    }

    std::vector<std::shared_ptr<entities::property>> basic::fetch_properties_like(odb::iobject& o){
        std::vector<std::shared_ptr<entities::property>> ps;
        for(auto &obj : properties.find_like(o))
            ps.emplace_back(entities::factory::make_entity<e::property>(*obj));
        return ps;
    }

    void basic::list_properties(){
        properties.list_objects();
    }

    void basic::list_model(int id){
        models.print_object(id);
    }

    int basic::random_seed(){
        return uint_dist(rng);
    }

    template<typename... Args>
    std::vector<std::shared_ptr<odb::iobject>> basic::query(odb::iobject& o, const std::tuple<Args...>& target){
        for(auto &obj : properties.find_like(o)){
            signature signature_(*obj);

            std::shared_ptr<entities::property> p(fetch_property(signature_.get_id()));
            if(p->is_undefined()){
                entities::controller ctrl;
                ctrl.resolve(*fetch_executable(p->get_executable()),*fetch_model(p->get_model()),*p);

                object record, serialized_cfg;
                p->serialize_cfg(serialized_cfg);
                p->serialize(record, serialized_cfg);

                object filter; writer::prop("_id", signature_.get_id()) >> filter;
                properties.replace(filter, record, signature_);
            }
        }
        return properties.find_like(o);
    }

} }

#endif
