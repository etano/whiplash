#include "wdb.hpp"

int main(int argc, char* argv[]){

    // Parse arguments
    framework::params_type params(argc,argv);

    // Instantiate framework
    framework f(params.pop<std::string>("dbhost"));

    framework::root_controller root(f.get_worker_pool());

    auto controller = wdb::entities::factory::make<framework::e::controller>("generic");
    root.add_controller( *controller );

    /*
    // custom (!) worker example //
    auto ising_controller = wdb::entities::factory::make<framework::e::controller>("ising");
    auto sat_controller   = wdb::entities::factory::make<framework::e::controller>("sat");
    auto xx_controller    = wdb::entities::factory::make<framework::e::controller>("xx");

    root.add_controller( *xx_controller ); // TOFIX: pull method should be controller-specific
    root.add_controller( *ising_controller );
    root.add_controller( *sat_controller );

    root.declare_segue( *sat_controller, *ising_controller );
    root.declare_segue( *ising_controller, *sat_controller );
    */

    root.yield();
    return 0;
}
