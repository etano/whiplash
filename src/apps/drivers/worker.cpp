#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using framework = wdb::deployment::basic;
using root_controller = wdb::rte::simple::root_controller;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    framework f(db);
    root_controller root(f.get_worker_pool());

    auto ising_controller = wdb::entities::factory::make<framework::e::controller>("ising");
    auto sat_controller   = wdb::entities::factory::make<framework::e::controller>("sat");
    auto qubo_controller  = wdb::entities::factory::make<framework::e::controller>("qubo");

    root.add_controller( *ising_controller );
    root.add_controller( *sat_controller );
    root.add_controller( *qubo_controller );

    root.declare_segue( *sat_controller, *ising_controller );
    root.declare_segue( *ising_controller, *sat_controller );

    root.yield();
    return 0;
}
