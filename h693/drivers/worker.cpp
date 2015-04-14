#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>

#include "simfw.hpp"

int main(int argc, char** argv){

    simfw::rte::cluster::executable test("test.app");
    test(argc, argv);

    return 0;
}
