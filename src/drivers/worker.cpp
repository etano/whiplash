#include "simfw.hpp"
using simfw::odb::mongo::objectdb;

int main(int argc, char** argv){
    objectdb db("cwave.ethz.ch:27017");
    simfw::deployment::basic sf(db);

    auto& test = sf.load("test.app");
    test(argc, argv);

    return 0;
}

