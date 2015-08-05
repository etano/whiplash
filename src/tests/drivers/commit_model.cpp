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
    std::string file = params["file"];
    params.erase("file");
    std::string owner = params["owner"];
    params.erase("owner");

    // Optional arguments
    int parent_id = -1;// wdb::optional<int>(std::stoi(params["parent_id"])) || wdb::optional<int>(-1);

    // User-defined arguments
    // (whatever is left in params)

    // Insert
    std::cout << sf.insert_model(problem_class,owner,file,parent_id,params) << std::endl;

    return 0;
}
