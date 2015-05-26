#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char** argv){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    void** params = (void**)malloc(sizeof(void*)*std::max(10,argc));
    for(int i = 0; i < argc; i++) params[i] = argv[i];

    auto H(sf.fetch_model(2));    params[1] = &H;
    auto I(sf.fetch_property(3)); params[2] = &I;

    auto& test = sf.load("test.app");
    test(argc, (char**)params);

    return 0;
}

