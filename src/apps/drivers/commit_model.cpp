#include "wdb.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);
    wdb::deployment::basic::params_type params(argc,argv);

    // Required arguments
    std::string problem_class = params.pop<std::string>("class");
    std::string owner = params.pop<std::string>("owner");
    std::string file = params.pop<std::string>("file");

    // Optional arguments
    wdb::optional<int> parent_id = params.pop<int>("parent_id");
    int reps = params.pop<int>("reps") or 1;

    // User-defined arguments
    // (whatever is left in params)

    // Insert
    for(int i = 0; i < reps; i++)
        std::cout << sf.insert_model(problem_class,owner,file,parent_id,params) << std::endl;

    return 0;
}
