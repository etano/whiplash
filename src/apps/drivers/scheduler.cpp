#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using framework = wdb::deployment::basic;
using scheduler = wdb::rte::simple::scheduler;

int main(int argc, char* argv[]){

    objectdb db("cwave.ethz.ch:27017");
    framework f(db);
    scheduler s(f.get_pool());

    s.yield();
    return 0;
}
