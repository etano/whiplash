#include "wdb.hpp"
#include "utils/parse_args.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    auto params = wdb::parse_args(argc,argv);

    std::string class_name = params["class"];
    params.erase("class");
    int model_id = std::stoi(params["model"]);
    params.erase("model");
    int executable_id = std::stoi(params["executable"]);
    params.erase("executable");
    std::string owner = params["owner"];
    params.erase("owner");
    std::cout << sf.insert_property(class_name, model_id, executable_id, params, owner) << std::endl;

    return 0;
}
