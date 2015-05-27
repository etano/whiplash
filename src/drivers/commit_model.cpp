#include "wdb.hpp"

using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[])
{
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    bsoncxx::builder::stream::document doc;

    bool have_key = false;
    std::string key;
    for (std::size_t i = 1; i < std::size_t(argc); ++i) {
      if (argv[i][0] == '-') {
        if(!have_key)
          have_key = true;
        key = argv[i] + 1;
      } else if (have_key) {
        doc << key << std::string(argv[i]);
        have_key = false;
      }
    }

    sf.insert_model(doc);

    return 0;
}
