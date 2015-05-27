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

    void basic::resolve_property(){
        // TODO
    }

    void basic::drop_collections(){
        db.drop_collection("properties");
        db.drop_collection("models");
    }

    void basic::init_counters(){
        using odb::mongo::prop_writer;
        odb::mongo::object properties_counter;
        prop_writer::prop("_id", "properties") >> properties_counter;
        static_cast<odb::mongo::collection&>(counters).remove( properties_counter );
        prop_writer::prop("seq", -1) >> properties_counter;
        static_cast<odb::mongo::collection&>(counters).insert( properties_counter );
        odb::mongo::object models_counter;
        prop_writer::prop("_id", "models") >> models_counter;
        static_cast<odb::mongo::collection&>(counters).remove( models_counter );
        prop_writer::prop("seq", -1) >> models_counter;
        static_cast<odb::mongo::collection&>(counters).insert( models_counter );
        odb::mongo::object executables_counter;
        prop_writer::prop("_id", "executables") >> executables_counter;
        static_cast<odb::mongo::collection&>(counters).remove( executables_counter );
        prop_writer::prop("seq", -1) >> executables_counter;
        static_cast<odb::mongo::collection&>(counters).insert( executables_counter );
    }

    void basic::assume_property(int hid, std::string solver, const std::vector<std::string>& params){
        odb::mongo::object serialized, serialized_state;
        entities::generic::property pb( hid, solver, params );
        pb.serialize_state(serialized_state);
        pb.serialize(db.get_next_id("properties"), serialized, serialized_state);
        static_cast<odb::mongo::collection&>(properties).insert( serialized );
    }

    void basic::insert_model(std::ifstream& in){
        odb::mongo::object serialized;
        entities::generic::model H( in );
        H.serialize(db.get_next_id("models"), serialized);
        static_cast<odb::mongo::collection&>(models).insert( serialized );
    }

    entities::generic::model basic::fetch_model(int id){
        return entities::generic::model( *models.find_object(id) );
    }

    entities::generic::property basic::fetch_property(int id){
        return entities::generic::property( *properties.find_object(id) );
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
