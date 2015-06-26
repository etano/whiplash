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
    for(const auto& result : deployment.query<double>(filter,"cost"))
        std::cout << basic::reader::read<double>(*result,"configuration","cost") << std::endl;

    return 0;
}
