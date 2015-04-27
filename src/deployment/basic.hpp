#ifndef SIMFW_DEPLOYMENT_BASIC_HPP
#define SIMFW_DEPLOYMENT_BASIC_HPP

namespace simfw { namespace deployment {

    basic::basic(odb::iobjectdb& db)
        : db(db),
        instances( db.provide_collection("instances") ),
        hamiltonians( db.provide_collection("hamiltonians") )
    {
    }

    void basic::insert_instance(int hid, std::string solver, const std::vector<std::string>& params){
        static_cast<odb::mongo::collection&>(instances).insert(
            odb::mongo::prop_writer::write_instance(db.get_next_id("instances"), hid, solver, params)
        );
    }

    void basic::insert_hamil(std::ifstream& in){
        static_cast<odb::mongo::collection&>(hamiltonians).insert(
            odb::mongo::prop_writer::write_hamil(db.get_next_id("hamiltonians"), in)
        );
    }

    void basic::fetch_hamil(int id){
        entities::generic::hamil H( hamiltonians.find_object(id) );
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
