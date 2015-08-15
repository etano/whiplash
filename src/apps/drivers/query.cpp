#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using framework = wdb::deployment::basic;

int main(int argc, char* argv[]){
    // Initialize database and deployment
    objectdb db("cwave.ethz.ch:27017");
    framework deployment(db);

    // Parse arguments
    framework::params_type params(argc,argv);

    // Required arguments
    std::string target = params.pop<std::string>("target");

    // Optional arguments

    // User defined arguments
    // (whatever is left in params)

    // Create query filter
    framework::object filter;
    for(const auto& param : params.get_container().unwrap()){
        if(wdb::utils::is_numeric(param.second))
            framework::writer::prop(param.first, wdb::utils::str_to_val<int>(param.second)) >> filter;
        else
            framework::writer::prop(param.first, param.second) >> filter;
    }

    // Query and print results
    for(const auto& results : deployment.query( filter, std::tie("cfg", target) )){
        for(const auto result : framework::reader::read<framework::reader::array_type>(*results, std::tie("cfg",target)).unwrap())
            std::cout << framework::reader::read<double>(result) << std::endl;
    }

    return 0;
}
