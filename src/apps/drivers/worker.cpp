#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");

    using dep = wdb::deployment::basic;

    dep sf(db);

    wdb::rte::slurm::root_controller rc;

    rc.add_controller( *wdb::entities::factory::make_entity<dep::e::controller>("ising") );
    rc.add_controller( *wdb::entities::factory::make_entity<dep::e::controller>("sat") );

    rc.yield();

    /*void** params = (void**)malloc(sizeof(void*)*std::max(10,argc));
    for(int i = 0; i < argc; i++) params[i] = argv[i];

    auto H(sf.fetch_model(0));    params[1] = &(*H);
    auto I(sf.fetch_property(0)); params[2] = &(*I);

    wdb::rte::slurm::executable test("apps/test.app");

    test(argc, (char**)params);
    free(params);*/

    return 0;
}
