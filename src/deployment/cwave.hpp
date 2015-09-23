#ifndef WDB_DEPLOYMENT_CWAVE_HPP
#define WDB_DEPLOYMENT_CWAVE_HPP

namespace wdb { namespace deployment {

    cwave::cwave()
      : db( "cwave.ethz.ch:27017" ),
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

    odb::icollection& cwave::get_models(){
        return models;
    }

    odb::icollection& cwave::get_properties(){
        return properties;
    }

    odb::icollection& cwave::get_executables(){
        return executables;
    }

    odb::iobjectdb& cwave::get_db(){
        return db;
    }

    rte::ipool& cwave::get_pool(){
        return pool;
    }

    rte::ipool& cwave::get_worker_pool(){
        return worker_pool;
    }

    cwave::job_pool::job_pool(odb::icollection& p)
        : properties(p) { }

    size_t cwave::job_pool::size(){
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

    std::shared_ptr<odb::iobject> cwave::job_pool::pull(){
        object old_status, new_status;
        writer::prop("status", (int)entities::property::status::UNDEFINED) >> old_status;
        writer::prop("status", (int)entities::property::status::PULLED) >> new_status;
        return properties.find_one_and_update(old_status, new_status);
    }

    void cwave::job_pool::process(odb::iobject& orig){
        int id = reader::read<int>(orig, "_id");
        object filter, new_status;
        writer::prop("_id", id) >> filter;
        writer::prop("status", (int)entities::property::status::PROCESSING) >> new_status;
    }

    void cwave::job_pool::push(odb::iobject& orig, rte::icacheable& mod){
        auto record = properties.create(); // FIXME: What is the point of this? Should it be done everywhere?
        auto cfg = properties.create();
        auto& p = static_cast<entities::property&>(mod);
        p.serialize_cfg(*cfg);
        p.serialize(*record, *cfg);
        properties.replace(orig, *record);
    }

} }

#endif
