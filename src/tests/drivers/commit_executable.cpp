#include "wdb.hpp"
#include "utils/parse_args.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    auto params = wdb::parse_args(argc,argv);

    // Required arguments
    std::string problem_class = params["class"];
    params.erase("class");
    std::string owner = params["owner"];
    params.erase("owner");
    std::string file = params["file"];
    params.erase("file");
    std::string description = params["description"];
    params.erase("description");
    std::string algorithm = params["algorithm"];
    params.erase("algorithm");
    std::string version = params["version"];
    params.erase("version");
    std::string build = params["build"];
    params.erase("build");

    // Optional arguments

    // User defined arguments
    // (whatever is left in params)

    // Insert
    std::cout << sf.insert_executable(problem_class,owner,file,description,algorithm,version,build,params) << std::endl;

    return 0;
}
