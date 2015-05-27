#include "wdb.hpp"
#include "arg_parser.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[])
{
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    sf.insert_executable(parse_args(argc,argv));

    return 0;
}
