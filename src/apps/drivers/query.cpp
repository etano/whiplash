#include "wdb.hpp"
using framework = wdb::deployment::cwave;

int main(int argc, char* argv[]){
    // Initialize database and deployment
    framework deployment;

    // Parse arguments
    framework::params_type params(argc,argv);

    // Required arguments
    std::vector<std::string> target = params.pop<std::vector<std::string>>("target");

    // Optional arguments

    // User defined arguments
    // (whatever is left in params)

    // Create query filter
    framework::object filter;
    for(const auto& param : params.get_container().unwrap()){
        if(wdb::utils::is_numeric(param.second)){
            double val = wdb::utils::str_to_val<double>(param.second);
            int ival = static_cast<int>(val);
            if(val==ival)
                framework::writer::prop(param.first, ival) >> filter;
            else
                framework::writer::prop(param.first, val) >> filter;
        }
        else
            framework::writer::prop(param.first, param.second) >> filter;
    }

    // Query and print results
    for(const auto& results : deployment.query( filter )){
        if(wdb::entities::property::is_undefined(*results))
            std::cout << "Unresolved property\n";
        else
            for(const auto result : framework::reader::read<framework::reader::array_type>(*results, target).unwrap())
                std::cout << framework::reader::read<double>(result) << std::endl;
    }

    return 0;
}
