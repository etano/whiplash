#include "wdb.hpp"

int main(int argc, char* argv[]){

    // Parse arguments
    framework::params_type params(argc,argv);

    // Instantiate framework
    framework f(params.pop<std::string>("dbhost"));

    // Required arguments
    std::string problem_class = params.pop<std::string>("class");
    std::string owner = params.pop<std::string>("owner");
    std::vector<std::string> paths = params.pop<std::vector<std::string>>("path");

    // Optional arguments
    wdb::optional<int> parent_id = params.pop<int>("parent_id");

    // User-defined arguments

    // Insert
    std::vector<int> ids = f.insert_models(problem_class,owner,paths,parent_id,params);
    for(auto& id : ids)
        std::cout << id << std::endl;

    return 0;
}
