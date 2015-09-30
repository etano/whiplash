#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

#define object_type typename D::object

namespace wdb { namespace deployment {

    template<class D>
    void basic<D>::format(){
        get_properties().purge();
        get_models().purge();
        get_executables().purge();
        get_db().reset_metadata();
    }
    template<class D>
    int basic<D>::insert_model(std::string problem_class, std::string owner, std::string path, optional<int> parent_id, optional<params_type> params){
        std::vector<std::string> paths{path};
        return insert_models(problem_class, owner, paths, parent_id, params)[0];
    }

    template<class D>
    int basic<D>::insert_property(std::string problem_class, std::string owner, int model_id, int executable_id, optional<params_type> params){
        std::vector<int> model_ids{model_id};
        int reps = 1;
        return insert_properties(problem_class, owner, model_ids, executable_id, params, reps)[0];
    }

    template<class D>
    std::vector<int> basic<D>::insert_models(std::string problem_class, std::string owner, const std::vector<std::string>& paths, optional<int> parent_id, optional<params_type> params){
        std::vector<std::shared_ptr<odb::iobject>> records;
        for(auto& path : paths){
            std::ifstream in(path);
            std::shared_ptr<entities::model> m(entities::factory::make<e::model>(problem_class, in, parent_id, params));
            in.close();
            object_type serialized_cfg;
            m->serialize_cfg(serialized_cfg);
            records.emplace_back(std::make_shared<object_type>());
            m->serialize(*records.back(), serialized_cfg);
        }
        return get_models().insert_many(records, get_db(), "models", owner);
    }

    template<class D>
    std::vector<int> basic<D>::insert_properties(std::string problem_class, std::string owner, const std::vector<int>& model_ids, int executable_id, optional<params_type> params, int reps){
        std::vector<std::shared_ptr<odb::iobject>> records;
        for(auto& model_id : model_ids)
            for(int i=0; i<reps; i++) {
                std::shared_ptr<entities::property> p(entities::factory::make<e::property>(problem_class, owner, model_id, executable_id, params, random_seed()));
                object_type serialized_cfg;
                p->serialize_cfg(serialized_cfg);
                records.emplace_back(std::make_shared<object_type>());
                p->serialize(*records.back(), serialized_cfg);
            }
        return get_properties().insert_many(records, get_db(), "properties", owner);
    }

    template<class D>
    int basic<D>::insert_executable(std::string problem_class, std::string owner, std::string path, std::string description, std::string algorithm, std::string version, std::string build, std::string name,  optional<params_type> params)
    {
        std::vector<std::shared_ptr<odb::iobject>> records;
        std::shared_ptr<entities::executable> x(entities::factory::make<e::executable>(problem_class, path, description, algorithm, version, build, name, params));

        object_type serialized_cfg;
        x->serialize_cfg(serialized_cfg);
        records.emplace_back(std::make_shared<object_type>());
        x->serialize(*records.back(), serialized_cfg);
        return get_executables().insert_many(records, get_db(), "executables", owner)[0];
    }

    template<class D>
    std::shared_ptr<entities::model> basic<D>::fetch_model(int id){
        return entities::factory::make<e::model>(*get_models().find(id));
    }

    template<class D>
    std::shared_ptr<entities::property> basic<D>::fetch_property(int id){
        return entities::factory::make<e::property>(*get_properties().find(id));
    }

    template<class D>
    std::shared_ptr<entities::executable> basic<D>::fetch_executable(int id){
        return entities::factory::make<e::executable>(*get_executables().find(id));
    }

    template<class D>
    std::vector<std::shared_ptr<entities::model>> basic<D>::fetch_models_like(odb::iobject& o){
        std::vector<std::shared_ptr<entities::model>> ms;
        for(auto& obj : get_models().find_like(o))
            ms.emplace_back(entities::factory::make<e::model>(*obj));
        return ms;
    }

    template<class D>
    std::vector<std::shared_ptr<entities::property>> basic<D>::fetch_properties_like(odb::iobject& o){
        std::vector<std::shared_ptr<entities::property>> ps;
        for(auto& obj : get_properties().find_like(o))
            ps.emplace_back(entities::factory::make<e::property>(*obj));
        return ps;
    }

    template<class D>
    void basic<D>::list_model(int id){
        get_models().print_object(id);
    }

    template<class D>
    void basic<D>::list_properties(){
        get_properties().list_objects();
    }

    template<class D>
    int basic<D>::random_seed(){
        return uint_dist(rng);
    }

    template<class D>
    int basic<D>::count_undefined(odb::iobject& o){
        unsigned n_undefined = 0;
        for(auto& obj : get_properties().find_like(o))
            if(entities::property::is_undefined(*obj)) n_undefined++;
        return n_undefined;
    }

    template<class D>
    std::vector<std::shared_ptr<odb::iobject>> basic<D>::query(odb::iobject& o){
        return get_properties().find_like(o);
    }

} }

#undef object_type 
#endif
