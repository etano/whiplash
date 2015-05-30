#ifndef WDB_ODB_MONGO_UTILS_HPP
#define WDB_ODB_MONGO_UTILS_HPP

namespace wdb { namespace odb { namespace mongo {

    bsoncxx::builder::stream::document parse_args(int argc, char *argv[]){
        bsoncxx::builder::stream::document doc;
        bool have_key = false;
        std::string key;
        for(int i = 1; i < argc; ++i){
            if(argv[i][0] == '-'){
                if(!have_key) have_key = true;
                key = argv[i] + 1;
            }else if(have_key){
                doc << key << std::string(argv[i]);
                have_key = false;
            }
        }
        return doc;
    }

} } }

#endif
