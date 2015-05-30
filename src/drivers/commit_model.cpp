#include "wdb.hpp"
#include "odb/mongo/utils.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    auto doc = wdb::odb::mongo::parse_args(argc,argv); // please, clean up me
    std::string file_name( doc.view()["file"].get_utf8().value );
    std::string model_class( doc.view()["class"].get_utf8().value );

    sf.insert_model(file_name, model_class);

    return 0;
}
