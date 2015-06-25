#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    std::string json_str = "{'class' : 'ising'}";
    std::vector<std::string> result = sf.query(json_str);
    for(const auto& r : result)
        std::cout << r << std::endl;

    return 0;
}
