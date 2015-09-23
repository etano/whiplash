#include "wdb.hpp"

int main(int argc, char* argv[]){
    framework f(DBHOST);
    framework::scheduler s(f.get_pool());
    s.yield();
    return 0;
}
