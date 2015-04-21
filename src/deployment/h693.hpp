#ifndef SIMFW_DEPLOYMENT_H693_HPP
#define SIMFW_DEPLOYMENT_H693_HPP

namespace simfw { namespace deployment {

    h693::h693(odb::iobjectdb& db)
        : db(db),
        instances( db.provide_collection("instances") ),
        hamiltonians( db.provide_collection("hamiltonians") )
    {
    }

    void h693::insert_instance(int hid, std::string solver, const std::vector<std::string>& params){
        static_cast<simfw::odb::mongo::collection&>(instances).insert(
            odb::mongo::prop_writer::write_instance(db.get_next_id("instances"), hid, solver, params)
        );
    }

    void h693::insert_hamil(std::ifstream& in){
        static_cast<simfw::odb::mongo::collection&>(hamiltonians).insert(
            odb::mongo::prop_writer::write_hamil(db.get_next_id("hamiltonians"), in)
        );
    }

    void h693::fetch_hamil(int id){
        const auto& res = hamiltonians.find_object(id);
        odb::mongo::prop_reader::read_hamil(static_cast<const simfw::odb::mongo::object&>(res));
    }

    void h693::list_instances(){
        instances.list_objects();
    }

    void h693::list_hamil(int id){
        hamiltonians.print_object(id);
    }

    rte::iexecutable& h693::load(std::string app){
        static rte::cluster::executable inst(app);
        return inst;
    }

} }

#endif
