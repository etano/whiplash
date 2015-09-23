#ifndef WDB_DEPLOYMENT_NODE_HPP
#define WDB_DEPLOYMENT_NODE_HPP

namespace wdb { namespace deployment {

    node::node(const std::string host)
      : db(host),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") ),
        executables( db.provide_collection("executables") ),
        pool( properties ),
        worker_pool( properties )
    {
        entities::factory::init<e::property>(properties);
        entities::factory::init<e::model>(models);
        entities::factory::init<e::executable>(executables);
    }

    odb::icollection& node::get_models(){
        return models;
    }

    odb::icollection& node::get_properties(){
        return properties;
    }

    odb::icollection& node::get_executables(){
        return executables;
    }

    odb::iobjectdb& node::get_db(){
        return db;
    }

    rte::ipool& node::get_pool(){
        return pool;
    }

    rte::ipool& node::get_worker_pool(){
        return worker_pool;
    }

    node::job_pool::job_pool(odb::icollection& p)
        : properties(p) { }

    size_t node::job_pool::size(){
        // TODO: Optimize this (possible with $or filter)
        object undefined_filter, pulled_filter, processing_filter;
        size_t tot = 0;
        writer::prop("status", (int)entities::property::status::UNDEFINED) >> undefined_filter;
        tot += properties.find_like(undefined_filter).size();
        writer::prop("status", (int)entities::property::status::PULLED) >> pulled_filter;
        tot += properties.find_like(pulled_filter).size();
        writer::prop("status", (int)entities::property::status::PROCESSING) >> processing_filter;
        tot += properties.find_like(processing_filter).size();
        return tot;
    }

    std::shared_ptr<odb::iobject> node::job_pool::pull(){
        object old_status, new_status;
        writer::prop("status", (int)entities::property::status::UNDEFINED) >> old_status;
        writer::prop("status", (int)entities::property::status::PULLED) >> new_status;
        return properties.find_one_and_update(old_status, new_status);
    }

    void node::job_pool::process(odb::iobject& orig){
        int id = reader::read<int>(orig, "_id");
        object filter, new_status;
        writer::prop("_id", id) >> filter;
        writer::prop("status", (int)entities::property::status::PROCESSING) >> new_status;
        properties.find_one_and_update(filter, new_status);
    }

    void node::job_pool::push(odb::iobject& orig, rte::icacheable& mod){
        auto record = properties.create(); // FIXME: What is the point of this? Should it be done everywhere?
        auto cfg = properties.create();
        auto& p = static_cast<entities::property&>(mod);
        p.serialize_cfg(*cfg);
        p.serialize(*record, *cfg);
        properties.replace(orig, *record);
    }

} }

#endif
