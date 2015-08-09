#include "wdb.hpp"
using wdb::odb::mongo::objectdb;
using wdb::deployment::basic;

int main(int argc, char* argv[]){
    // Initialize database and deployment
    objectdb db("cwave.ethz.ch:27017");
    basic deployment(db);

    // Create query object
    basic::object filter;
    basic::writer::prop("class", std::string("ising")) >> filter;

    // Query and print results
    for(const auto& result : deployment.query( filter, std::tie("cfg", "costs") )){
        for(const auto cost : basic::reader::read<basic::reader::array_type>(*result, std::tie("cfg","costs")).unwrap())
            std::cout << basic::reader::read<double>(cost) << std::endl;
    }

    return 0;
}
