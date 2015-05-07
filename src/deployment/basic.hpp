#ifndef WDB_DEPLOYMENT_BASIC_HPP
#define WDB_DEPLOYMENT_BASIC_HPP

namespace wdb { namespace deployment {

    basic::basic(odb::iobjectdb& db)
        : db(db),
        instances( db.provide_collection("instances") ),
        hamiltonians( db.provide_collection("hamiltonians") )
    {
    }

    void basic::update_instance(){
        // TODO
    }

    void basic::insert_instance(int hid, std::string solver, const std::vector<std::string>& params){
        odb::mongo::object serialized, serialized_state;
        entities::generic::instance pb( hid, solver, params );
        pb.serialize_state(serialized_state);
        pb.serialize(db.get_next_id("instances"), serialized, serialized_state);
        static_cast<odb::mongo::collection&>(instances).insert( serialized );
    }

    void basic::insert_hamil(std::ifstream& in){
        odb::mongo::object serialized;
        entities::generic::hamil H( in );
        H.serialize(db.get_next_id("hamiltonians"), serialized);
        static_cast<odb::mongo::collection&>(hamiltonians).insert( serialized ); 
    }

    entities::generic::hamil basic::fetch_hamil(int id){
        return entities::generic::hamil( *hamiltonians.find_object(id) );
    }

    entities::generic::instance basic::fetch_instance(int id){
        return entities::generic::instance( *instances.find_object(id) );
    }

    void basic::list_instances(){
        instances.list_objects();
    }

    void basic::list_hamil(int id){
        hamiltonians.print_object(id);
    }

    rte::iexecutable& basic::load(std::string app){
        static rte::cluster::executable inst(app);
        return inst;
    }

} }

#endif
