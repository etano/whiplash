#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int, char**){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    sf.fetch_property(17).info();
    return 0;
}

