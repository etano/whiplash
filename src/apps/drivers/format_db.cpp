#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using framework = wdb::deployment::basic;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    framework f(db);

    f.format();
    return 0;
}
