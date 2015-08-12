#include "wdb.hpp"

using objectdb = wdb::odb::mongo::objectdb;
using framework = wdb::deployment::basic;

int main(int argc, char* argv[]){
    // Initialize database and deployment
    objectdb db("cwave.ethz.ch:27017");
    framework deployment(db);

    // Create query object
    framework::object filter;
    framework::writer::prop("class", std::string("ising")) >> filter;

    // Query and print results
    for(const auto& result : deployment.query( filter, std::tie("cfg", "costs") )){
        for(const auto cost : framework::reader::read<framework::reader::array_type>(*result, std::tie("cfg","costs")).unwrap())
            std::cout << framework::reader::read<double>(cost) << std::endl;
    }

    return 0;
}
