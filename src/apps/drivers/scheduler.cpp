#include "wdb.hpp"
using framework = wdb::deployment::cwave;

int main(int argc, char* argv[]){
    framework f;
    framework::scheduler s(f.get_pool());
    s.yield();
    return 0;
}
