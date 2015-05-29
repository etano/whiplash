#ifndef WDB_UTILS_ARG_PARSER_HPP
#define WDB_UTILS_ARG_PARSER_HPP

namespace wdb { namespace utils {
    bsoncxx::builder::stream::document parse_args(int argc, char *argv[]){
        bsoncxx::builder::stream::document doc;
        bool have_key = false;
        std::string key;
        for(std::size_t i = 1; i < std::size_t(argc); ++i){
            if (argv[i][0] == '-') {
                if(!have_key)
                    have_key = true;
                key = argv[i] + 1;
            } else if (have_key) {
                doc << key << std::string(argv[i]);
                have_key = false;
            }
        }
        return doc;
    }
} }

#endif
