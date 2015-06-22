#include "wdb.hpp"
#include "utils.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    auto params = wdb::parse_args(argc,argv);

    sf.insert_executable(params["file"],params["class"]);

    return 0;
}
