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
    std::vector<int> model_ids = params.pop<std::vector<int>>("model");
    int executable_id = params.pop<int>("executable");

    // Optional arguments
    int reps = params.pop<int>("reps") or 1;

    // User defined arguments
    // (whatever is left in params)

    // Insert
    std::vector<int> ids = f.insert_properties(problem_class, owner, model_ids, executable_id, params, reps);

    return 0;
}
