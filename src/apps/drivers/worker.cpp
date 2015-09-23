#include "wdb.hpp"

int main(int argc, char* argv[]){
    framework f(DBHOST);
    framework::root_controller root(f.get_worker_pool());

    auto controller = wdb::entities::factory::make<framework::e::controller>("generic");
    root.add_controller( *controller );
    root.yield();

    return 0;
}
