#include "simfw.hpp"
using simfw::odb::mongo::objectdb;

int main(int, char**){
    objectdb db("cwave.ethz.ch:27017");
    simfw::deployment::h693 sf(db);

    sf.list_instances();
    sf.list_hamil(18);

    return 0;
}

