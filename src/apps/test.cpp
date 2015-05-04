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

int main(int argc, char* argv[])
{
  const std::string input_file(argv[1]);
  const std::string output_file(argv[2]);
  const unsigned Nr(std::stoi(argv[3]));
  
  std::ifstream in(input_file);
  simfw::entities::generic::hamil H(in);
  in.close();

  std::cout << "num nodes: " << H.num_nodes() << "\n"
            << "num edges: " << H.num_edges() << "\n";

  double Emin(std::numeric_limits<double>::max());
  std::vector<bool> config_min;
  for(unsigned i = 0; i < Nr; ++i){

      std::vector<bool> config(H.num_nodes());
      for(unsigned j = 0; j < H.num_nodes(); ++j)
          config[j] = (drand48() < 0.5);
      
      const double E(H.total_energy(config));
      
      if(E < Emin){
          Emin = E;
          config_min = config;
      }
  }

  std::ofstream out(output_file);
  assert(out.is_open());
  out << config_min << ' ' << Emin << "\n";
  out.close();

  return 0;
}
