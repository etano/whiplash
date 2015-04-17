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

typedef std::pair<std::vector<unsigned>, double> edge_type;

template <class T>
std::string tostring(const std::vector<T>& vec)
{
  std::string str;
  for(const auto a : vec)
    str += std::to_string(a) + " ";

  return str;
}

template <class T>
std::ostream& operator<<(std::ostream& os, const std::vector<T>& x)
{
  std::copy(x.begin(),x.end(),std::ostream_iterator<T>(os," "));
  return os;
}

std::pair<std::size_t,std::vector<edge_type> > read_graph(const std::string& config_file)
{
  std::ifstream in(config_file);
  assert(in);

  std::size_t N(0);
  std::map<std::string,unsigned> index;

  std::unordered_set<std::string> edge_set;
  std::vector<edge_type> edges;
  while(in){

    std::string input_str;

    if(!std::getline(in,input_str)) break;

    if(input_str.find(' ') != std::string::npos && input_str.find('#') == std::string::npos){

      std::istringstream tmp0(input_str);
      std::vector<std::string> input;
      while (tmp0){
        std::string s;
        if (!std::getline(tmp0, s, ' ')) break;
        input.push_back(s);
      }

      const double val(std::stod(input[input.size()-1]));

      if(val != 0.0){

        edge_type edge;

        edge.second = val;

        for(unsigned i = 0; i < input.size()-1; ++i){
          const std::string site(input[i]);
          if(index.find(site) == index.end())
            index[site] = N++;
          edge.first.push_back(index[site]);
        }

        std::sort(edge.first.begin(),edge.first.end(),std::less<unsigned>());

        const std::string mark(tostring(edge.first));

        if(edge_set.find(mark) == edge_set.end()){
          edges.push_back(edge);
          edge_set.insert(mark);
        }
      }
    }
  }
  in.close();

  std::cout
    << "num nodes: " << N << "\n"
    << "num edges: " << edges.size()
    << std::endl;

  return std::make_pair(N,edges);
}

double compute_energy(const std::vector<bool>& config, const std::vector<edge_type>& edges)
{
  double E(0.0);
  for(const auto edge : edges){

    bool tmp(0);
    for(const auto b : edge.first)
      tmp ^= config[b];

    E += (2*tmp-1) * edge.second * (2*int(edge.first.size()%2) - 1);
  }

  return E;
} 

int main(int argc, char* argv[])
{
  const std::string input_file(argv[1]);
  const std::string output_file(argv[2]);
  const unsigned Nr(std::stoi(argv[3]));
  
  const auto tmp(read_graph(input_file));
  const std::size_t N(tmp.first);
  const auto edges(tmp.second);

  double Emin(std::numeric_limits<double>::max());
  std::vector<bool> config_min;
  for(unsigned i = 0; i < Nr; ++i){

    std::vector<bool> config(N);
    for(unsigned j = 0; j < N; ++j)
      config[j] = (drand48() < 0.5);

    const double E(compute_energy(config,edges));

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
