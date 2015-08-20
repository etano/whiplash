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

    std::vector<std::shared_ptr<odb::iobject>> cwave::query(odb::iobject& o){
        entities::controller c;
        root_controller r(get_worker_pool());
        r.add_controller(c);
        r.yield();
        return properties.find_like(o);
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
        return pull().size(); // TODO: optimize me
    }

    std::vector<std::shared_ptr<odb::iobject>> cwave::job_pool::pull(){
        object filter;
        writer::prop("status", (int)entities::property::status::UNDEFINED) >> filter;
        return properties.find_like(filter);
    }

    void cwave::job_pool::push(odb::iobject& orig, rte::icacheable& mod){
        auto record = properties.create();
        auto cfg = properties.create();
        auto& p = static_cast<entities::property&>(mod);
        p.serialize_cfg(*cfg);
        p.serialize(*record, *cfg);
        properties.replace(orig, *record);
    }

} }

#endif
