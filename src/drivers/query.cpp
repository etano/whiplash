#include "wdb.hpp"

using namespace wdb::deployment;

int main(int argc, char* argv[]){
    // Init database and framework
    wdb::odb::mongo::objectdb db("cwave.ethz.ch:27017");
    basic deployment(db);

    // Create query object
    basic::object filter;
    basic::writer::prop("class", std::string("ising")) >> filter;

    // Query and print results
    for(const auto& result : deployment.query(filter))
        std::cout << basic::reader::Double(*result,"configuration","cost") << std::endl;

    return 0;
}
