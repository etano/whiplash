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

#include "simfw.hpp"
#include "entities/generic/hamil.hpp"

template <class T>
std::ostream& operator<<(std::ostream& os, const std::vector<T>& x){
    std::copy(x.begin(),x.end(),std::ostream_iterator<T>(os," "));
    return os;
}

int main(int argc, char* argv[]){
    const std::string output_file(argv[2]);
    const unsigned Nr(std::stoi(argv[3]));

    simfw::entities::generic::hamil* H = (simfw::entities::generic::hamil*)argv[1];

    double Emin(std::numeric_limits<double>::max());
    std::vector<bool> config_min;
    for(unsigned i = 0; i < Nr; ++i){
        std::vector<bool> config(H->num_nodes());
        for(unsigned j = 0; j < H->num_nodes(); ++j)
            config[j] = (drand48() < 0.5);
        const double E(H->total_energy(config));
        if(E < Emin){
            Emin = E;
            config_min = config;
        }
    }

    std::ofstream out(output_file);
    out << config_min << ' ' << Emin << "\n";
    out.close();

    return 0;
}
