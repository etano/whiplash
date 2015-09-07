#include "wdb.hpp"
using framework = wdb::deployment::cwave;

int main(int argc, char* argv[]){
    framework f;
    framework::root_controller root(f.get_worker_pool());

    auto ising_controller = wdb::entities::factory::make<framework::e::controller>("ising");
    auto sat_controller   = wdb::entities::factory::make<framework::e::controller>("sat");
    auto xx_controller    = wdb::entities::factory::make<framework::e::controller>("xx");

    root.add_controller( *xx_controller ); // TOFIX: pull method should be controller-specific
    root.add_controller( *ising_controller );
    root.add_controller( *sat_controller );

    root.declare_segue( *sat_controller, *ising_controller );
    root.declare_segue( *ising_controller, *sat_controller );

    root.yield();
    return 0;
}
