#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using framework = wdb::deployment::basic;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    framework f(db);

    // Parse arguments
    framework::params_type params(argc,argv);

    // Required arguments
    std::string problem_class = params.pop<std::string>("class");
    std::string owner = params.pop<std::string>("owner");
    std::string path = params.pop<std::string>("path");

    // Optional arguments
    wdb::optional<int> parent_id = params.pop<int>("parent_id");
    int reps = params.pop<int>("reps") or 1;

    // User-defined arguments
    // (whatever is left in params)

    // Insert
    for(int i = 0; i < reps; i++)
        std::cout << f.insert_model(problem_class,owner,path,parent_id,params) << std::endl;

    return 0;
}
