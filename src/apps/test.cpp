#include <vector>
#include <iostream>
#include <unordered_set>
#include <map>
#include <fstream>
#include <cassert>
#include <sstream>
#include <string>
#include <iterator>
#include <algorithm>

#include "wdb.hpp"
#include "entities/generic/hamil.hpp"

template <class T>
std::ostream& operator<<(std::ostream& os, const std::vector<T>& x){
    std::copy(x.begin(),x.end(),std::ostream_iterator<T>(os," "));
    return os;
}

int main(int argc, char* argv[]){

    wdb::entities::generic::hamil* H = (wdb::entities::generic::hamil*)argv[1];
    wdb::entities::generic::instance* I = (wdb::entities::generic::instance*)argv[2];

    int Nr = std::stoi( I->param<0>() );
    double Emin(std::numeric_limits<double>::max());
    std::vector<bool> config_min;
    for(int i = 0; i < Nr; ++i){
        std::vector<bool> config(H->num_nodes());
        for(int j = 0; j < H->num_nodes(); ++j)
            config[j] = (drand48() < 0.5);
        const double E(H->total_energy(config));
        if(E < Emin){
            Emin = E;
            config_min = config;
        }
    }

    std::cout << config_min << ' ' << Emin << "\n";
    return 0;
}
