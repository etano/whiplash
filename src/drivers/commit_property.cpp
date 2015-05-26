#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int, char**){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    std::vector<std::string> params;
    params.push_back("7");
    params.push_back("13");

    sf.assume_property(2, "ising_s0", params);

    return 0;
}

