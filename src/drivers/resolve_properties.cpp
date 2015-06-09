#include <stdlib.h>
#include <unistd.h>
#include <sys/stat.h>
#include <syslog.h>
#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    // Check for unresolved properties and resolve them
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);
    sf.resolve_properties();
}
