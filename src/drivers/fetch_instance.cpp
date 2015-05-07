#include "simfw.hpp"
using simfw::odb::mongo::objectdb;

int main(int, char**){
    objectdb db("cwave.ethz.ch:27017");
    simfw::deployment::basic sf(db);

    sf.fetch_instance(17).info();
    return 0;
}

