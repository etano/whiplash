#include "wdb.hpp"

int main(int argc, char* argv[]){

    // Parse arguments
    framework::params_type params(argc,argv);

    // Instantiate framework
    framework f(params.pop<std::string>("dbhost"));

    f.format();
    return 0;
}
