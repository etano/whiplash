#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using scheduler = wdb::rte::simple::scheduler;
using framework = wdb::deployment::basic;

int main(int argc, char* argv[]){

    objectdb db("cwave.ethz.ch:27017");
    scheduler s(db, argv[0]);

    return 0;
}
