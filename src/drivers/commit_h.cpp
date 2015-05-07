#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int, char**){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    std::ifstream in("apps/hamil");
    sf.insert_hamil(in);
    in.close();

    return 0;
}

