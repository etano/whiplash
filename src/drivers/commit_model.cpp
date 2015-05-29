#include "wdb.hpp"
#include "utils/arg_parser.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    sf.insert_model(wdb::utils::parse_args(argc,argv));

    return 0;
}
