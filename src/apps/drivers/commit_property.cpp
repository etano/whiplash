#include "wdb.hpp"
#include "utils/parse_args.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    auto params = wdb::parse_args(argc,argv);

    // Required arguments
    std::string class_name = params["class"];
    params.erase("class");
    std::string owner = params["owner"];
    params.erase("owner");
    int model_id = std::stoi(params["model"]);
    params.erase("model");
    int executable_id = std::stoi(params["executable"]);
    params.erase("executable");

    // Optional arguments

    // User defined arguments
    // (whatever is left in params)

    // Insert
    std::cout << sf.insert_property(class_name, owner, model_id, executable_id, params) << std::endl;

    return 0;
}
