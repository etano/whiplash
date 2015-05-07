#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
        : db(db),
        properties( db.provide_collection("properties") ),
        models( db.provide_collection("models") )
    {
    }

    void basic::resolve_property(){
        // TODO
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
