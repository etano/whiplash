#include "wdb.hpp"
#include "utils/parse_args.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    auto params = wdb::parse_args(argc,argv);
    std::cout << sf.insert_executable(params["file"], params["class"], params["description"], params["algorithm"], params["cfg"], params["version"], params["build"], params["owner"]) << std::endl;

    return 0;
}
