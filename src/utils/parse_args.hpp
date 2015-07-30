#ifndef WDB_UTILS_PARSE_ARGS_HPP
#define WDB_UTILS_PARSE_ARGS_HPP

namespace wdb {

  std::unordered_map<std::string,std::string> parse_args(int argc, char *argv[]){
        std::unordered_map<std::string,std::string> params;
        bool have_key = false;
        std::string key;
        for(int i = 1; i < argc; ++i){
            if(argv[i][0] == '-'){
                if(!have_key) have_key = true;
                key = argv[i] + 1;
            }else if(have_key){
                params[key] = std::string(argv[i]);
                have_key = false;
            }
        }
        return params;
    }

}

#endif
