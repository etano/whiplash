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

            std::string model_class = input[0];
            int model_id = std::stoi(input[1]);
            int executable_id = std::stoi(input[2]);
            std::vector<std::string> params;
            for(int i = 3; i < input.size(); ++i)
                params.push_back(input[i]);
            sf.insert_property(model_class, model_id, executable_id, params, "akosenko");
        }
    }
    return 0;
}
