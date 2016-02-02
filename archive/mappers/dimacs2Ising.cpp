#include <iostream>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <iterator>
#include <string>
#include <cassert>
#include <vector>
#include <unordered_map>

template <class T>
std::ostream& operator<<(std::ostream& os, const std::vector<T>& x)
{
  std::copy(x.begin(),x.end(),std::ostream_iterator<T>(os," "));
  return os;
}

std::vector<std::string> split_string(const std::string& input_str, const char delim)
{
  std::istringstream tmp(input_str);
  std::vector<std::string> input;
  while (tmp){
    std::string s;
    if (!std::getline(tmp, s, ' ')) break;
    input.push_back(s);
  }  
  return input;
}

inline std::size_t to_decimal(const std::vector<bool>& config)
{
  std::size_t ii(0);
  for(unsigned i = 0; i < config.size(); ++i)
    ii += config[i] ? (1ul << i) : 0;

  return ii;
}

inline std::vector<bool> to_config(std::size_t ii, const std::size_t n)
{
  std::vector<bool> config(n);
  for(unsigned j = 0; j < n; ++j, ii >>= 1)
    config[j] = ii&0x1;

  return config;
}

void gen(unsigned offset, int k, const std::vector<unsigned>& spins, std::vector<unsigned>& tmp, std::vector<std::vector<unsigned> >& combinations)
{
  if(k == 0){
    combinations.push_back(tmp);
    return;
  }
  for(unsigned i = offset; i <= spins.size() - k; ++i){
    tmp.push_back(spins[i]);
    gen(i+1, k-1, spins, tmp, combinations);
    tmp.pop_back();
  }
}

std::vector<std::vector<unsigned> > get_combinations(const unsigned num_spins, const unsigned kmax)
{
  assert(kmax <= num_spins);

  std::vector<unsigned> spins(num_spins);
  for(unsigned i = 0; i < num_spins; ++i)
    spins[i] = i;

  std::vector<std::vector<unsigned> > combinations;
  for(unsigned k = 0; k <= kmax; ++k){
    std::vector<unsigned> tmp;
    gen(0, k, spins, tmp, combinations);
  }    

  return combinations;
}

struct term_type
{
  term_type()
    : value(0)
  {}

  term_type(const double val, const std::vector<unsigned>& inds)
    : value(val)
    , indices(inds)
  {}

  bool operator==(const term_type& in) const {return this->indices == in.indices;}
  bool operator>(const term_type& in) const {return this->indices.size() > in.indices.size();}
  bool operator<(const term_type& in) const {return this->indices.size() < in.indices.size();}

  double value;
  std::vector<unsigned> indices;
};


typedef std::vector<term_type> hamiltonian_type;

hamiltonian_type build_hamiltonian(const std::size_t n, const std::vector<double>& energies)
{
  const std::size_t N(uint64_t(1) << n);
  assert(energies.size() == N);

  const std::vector<std::vector<unsigned> > combinations(get_combinations(n,n));
  assert(combinations.size() == N);

  hamiltonian_type H;

  for(const auto& comb : combinations){

    double h(0.0);
    for(std::size_t i = 0; i < N; ++i){

      const auto config(to_config(i,n));

      bool tmp(0);
      for(const auto c : comb)
        tmp ^= config[c];

      h += (2*int(tmp)-1) * (2*int(comb.size()%2) - 1) * energies[i];
    }
    h /= N;

    if(std::fabs(h) > 1e-10)
      H.push_back(term_type(h,comb));
  }  

  return H;
}

int main(int argc, char* argv[])
{
  assert(argc == 3);

  const std::string in_file(argv[1]);
  const std::string out_file(argv[2]);

  hamiltonian_type H;

  std::ifstream in(in_file);
  assert(in);

  const bool weighted(in_file.find(".wcnf") != std::string::npos);

  std::unordered_map<unsigned,unsigned> index_tot;
  std::size_t N(0);

  while(in){

    std::string input_str;

    if(!std::getline(in,input_str)) break;

    if(input_str[0] == 'c' || input_str[0] == 'p')
      std::cout << input_str << std::endl;
    else{

      const auto input(split_string(input_str,' '));

      const double val(weighted ? std::stod(input[0]) : 1.0);

      if(val != 0.0){

        std::vector<bool> config;
        std::vector<unsigned> index;
        for(unsigned i = (weighted ? 1 : 0); i < input.size()-1; ++i){
          const int var(std::stoi(input[i]));
          const unsigned site(std::abs(var)-1);
          if(index_tot.find(site) == index_tot.end())
            index_tot[site] = N++;
          config.push_back(!(var > 0.0));
          index.push_back(site);
        }
        
        const unsigned n(config.size());
        std::vector<double> energies(uint64_t(1)<<n,0.0);
        energies[to_decimal(config)] = val;
        const hamiltonian_type H0(build_hamiltonian(n,energies));
        for(const auto& term : H0){

          term_type term1;
          term1.value = term.value;
          for(const auto a : term.indices)
            term1.indices.push_back(index[a]);

          std::sort(term1.indices.begin(),term1.indices.end());

          const auto it(std::find(H.begin(),H.end(),term1));

          if(it != H.end()){
            it->value += term1.value;
            if(std::fabs(it->value) < 1e-10)
              H.erase(it);
          }
          else
            H.push_back(term1);
        }
      }
    }
  }
  in.close();

  assert(index_tot.size() == N);

  std::sort(H.begin(),H.end(),std::less<term_type>());

  std::ofstream out(out_file);
  assert(out.is_open());

  out << "# " << std::to_string(N) << ' ' << std::to_string(H.size()) << "\n";
  for(const auto& term : H)
    out << term.indices << term.value << "\n";

  out.close();

  return 0;
}
