#include "wdb.hpp"
using wdb::odb::mongo::objectdb;
using wdb::deployment::basic;

int main(int argc, char* argv[]){
    // Init database and framework
    objectdb db("cwave.ethz.ch:27017");
    basic deployment(db);

    // Create query object
    basic::object filter;
    basic::writer::prop("class", std::string("ising")) >> filter;

    // Query and print results
    for(const auto& result : deployment.query(filter))
        std::cout << basic::reader::Double(*result,"configuration","cost") << std::endl;

    return 0;
}
