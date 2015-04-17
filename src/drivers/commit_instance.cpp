#include "simfw.hpp"
using simfw::odb::mongo::objectdb;

int main(int, char**){
    objectdb db("cwave.ethz.ch:27017");
    simfw::deployment::h693 sf(db);

    std::vector<std::string> params;
    params.push_back("7");
    params.push_back("13");

    sf.insert_instance(18, "ising_s0", params);

    return 0;
}

