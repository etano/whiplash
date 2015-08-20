#include "wdb.hpp"
using framework = wdb::deployment::cwave;

int main(int argc, char* argv[]){
    framework f;

    // Parse arguments
    framework::params_type params(argc,argv);

    // Required arguments
    std::string problem_class = params.pop<std::string>("class");
    std::string owner = params.pop<std::string>("owner");
    std::string path = params.pop<std::string>("path");
    std::string description = params.pop<std::string>("description");
    std::string algorithm = params.pop<std::string>("algorithm");
    std::string version = params.pop<std::string>("version");
    std::string build = params.pop<std::string>("build");

    // Optional arguments

    // User defined arguments
    // (whatever is left in params)

    // Insert
    std::cout << f.insert_executable(problem_class,owner,path,description,algorithm,version,build,params) << std::endl;

    return 0;
}
