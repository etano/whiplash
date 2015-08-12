#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using framework = wdb::deployment::basic;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    framework f(db);
    wdb::rte::simple::root_controller root;

    auto ising_controller = wdb::entities::factory::make_entity<framework::e::controller>("ising");
    auto sat_controller   = wdb::entities::factory::make_entity<framework::e::controller>("sat");
    auto qubo_controller  = wdb::entities::factory::make_entity<framework::e::controller>("qubo");

    root.add_controller( *ising_controller );
    root.add_controller( *sat_controller );
    root.add_controller( *qubo_controller );

    root.declare_segue( *sat_controller, *ising_controller );
    root.declare_segue( *ising_controller, *sat_controller );

    root.yield();
    return 0;
}
