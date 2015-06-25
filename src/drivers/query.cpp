#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    wdb::deployment::object o;
    wdb::deployment::prop_writer::prop("class", std::string("ising")) >> o;
    std::vector<std::shared_ptr<wdb::odb::iobject>> result(sf.query(o));
    for(const auto& r : result)
        std::cout << *r << std::endl;

    return 0;
}
