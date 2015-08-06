#include "wdb.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    wdb::params_type params(argc,argv);

    // Required arguments
    std::string problem_class = params.pop<std::string>("class");
    std::string owner = params.pop<std::string>("owner");
    std::string file = params.pop<std::string>("file");
    std::string description = params.pop<std::string>("description");
    std::string algorithm = params.pop<std::string>("algorithm");
    std::string version = params.pop<std::string>("version");
    std::string build = params.pop<std::string>("build");

    // Optional arguments

    // User defined arguments
    // (whatever is left in params)

    // Insert
    std::cout << sf.insert_executable(problem_class,owner,file,description,algorithm,version,build,params) << std::endl;

    return 0;
}
