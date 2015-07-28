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

int main(int argc, char* argv[]){

    wdb::entities::ising::model& H = *(wdb::entities::ising::model*)argv[1];
    wdb::entities::ising::property& I = *(wdb::entities::ising::property*)argv[2];

    int Nr = std::stoi( I.param<0>() );
    double Emin(std::numeric_limits<double>::max());
    std::vector<int> config_min;
    for(int i = 0; i < Nr; ++i){
        std::vector<int> config(H.num_nodes());
        for(int j = 0; j < H.num_nodes(); ++j)
            config[j] = (drand48() < 0.5);
        const double E(H.total_energy(config));
        if(E < Emin){
            Emin = E;
            config_min = config;
        }
    }

    I.set_configuration(config_min, Emin);

    return 0;
}
