#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);
    std::vector<wdb::entities::generic::property> unresolved_properties(sf.fetch_unresolved_properties());
    for (auto p : unresolved_properties){
        p.info();
    }
    return 0;
}
