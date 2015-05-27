#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    objectdb db("cwave.ethz.ch:27017");
    wdb::deployment::basic sf(db);

    std::ifstream in(argv[1]);
    std::map<std::string,int> index;
    while(in){
        std::string input_str;
        if(!std::getline(in,input_str)) break;

        if(input_str.find(' ') != std::string::npos && input_str.find('#') == std::string::npos){
            std::istringstream tmp0(input_str);
            std::vector<std::string> input;
            while(tmp0){
                std::string s;
                if(!std::getline(tmp0, s, ' ')) break;
                input.push_back(s);
            }

            int model_id = std::stoi(input[0]);
            int executable_id = std::stoi(input[1]);
            std::vector<std::string> params;
            for(int i = 2; i < input.size(); ++i)
                params.push_back(input[i]);
            sf.assume_property(model_id, executable_id, params);
        }
    }


    return 0;
}

