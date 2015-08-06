#include "wdb.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);
    wdb::deployment::basic::params_type params(argc,argv);

    // Required arguments
    std::string problem_class = params.pop<std::string>("class");
    std::string owner = params.pop<std::string>("owner");
    std::vector<int> model_ids = params.pop<std::vector<int>>("model");
    int executable_id = params.pop<int>("executable");

    // Optional arguments
    int reps = params.pop<int>("reps",1);

    // User defined arguments
    // (whatever is left in params)

    // Insert
    for(auto& model_id : model_ids)
        for(int i=0; i<reps; i++)
            std::cout << sf.insert_property(problem_class, owner, model_id, executable_id, params) << std::endl;

    return 0;
}
