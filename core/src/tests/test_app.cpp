#include <vector>
#include <stdlib.h>

#include "wdb.hpp"

int main(int argc, char* argv[]){

    wdb::entities::ising::model& H = wdb::find<wdb::entities::ising::model>(argc, argv);
    wdb::entities::ising::property& I = wdb::find<wdb::entities::ising::property>(argc, argv);

    int n_sweeps = I.get_param<int>("n_sweeps");
    int seed = I.get_seed();
    srand(seed);
    double Emin(std::numeric_limits<double>::max());
    std::vector<int> config_min;
    for(int i = 0; i < n_sweeps; ++i){
        std::vector<int> config(H.num_nodes());
        for(int j = 0; j < H.num_nodes(); ++j)
            config[j] = (rand() < (RAND_MAX/2));
        const double E(H.total_energy(config));
        if(E < Emin){
            Emin = E;
            config_min = config;
        }
    }

    I.set_cfg(config_min, Emin);

    return 0;
}