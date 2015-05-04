#include "simfw.hpp"
using simfw::odb::mongo::objectdb;

int main(int argc, char** argv){
    objectdb db("cwave.ethz.ch:27017");
    simfw::deployment::basic sf(db);

    auto H(sf.fetch_hamil(18));
    argv[1] = (char*)&H;

    auto& test = sf.load("test.app");
    test(argc, argv);

    return 0;
}

