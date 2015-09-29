
#include <time_evolution.hpp>

//#include <entities/ising/model.hpp>
//#include <entities/ising/property.hpp>
//#include <utils/find.hpp>
#include "wdb.hpp"

#include <complex>
#include <vector>
#include <iostream>
#include <set>

namespace {

using model_type = wdb::entities::ising::model;
using property_type = wdb::entities::ising::property;

struct aqc{

    aqc( unsigned N                 ///< number of sites
       , const std::vector<model_type::edge_type>& bonds  ///< system config
       , double Ttot                ///< time to simulate
       , unsigned nsteps            ///< steps to make
       , double hx                  ///< field magnitude in x-direction
       )
        : N_(N)
        , Ttot_(Ttot)
        , tau_(Ttot/nsteps)
        , a_(0.)
        , hx_(std::vector<double>(N,hx))
        , psi_out_(1<<N)
        , psi_in_(1<<N, 1./std::sqrt(1<<N)) //initial groundstate wf of transv. field
    {
        std::set<qsit::site_t> site_counter;
        
        for(auto bond : bonds){
            Jz_.push_back(bond.second);
            if(bond.first.size() != 2){
                throw std::runtime_error("unitary evolution solver only supports 2-node edges"
                                         ", found " + std::to_string(bond.first.size()) + ".");
            }
            edges.push_back(std::make_pair(bond.first[0], bond.first[1]));
            site_counter.insert(bond.first[0]);
            site_counter.insert(bond.first[1]);
        }

        std::copy(site_counter.begin(), site_counter.end(), std::back_inserter(sites));
    }
    
    using wf_t = qsit::wf_t;
    using config_t = qsit::config_t;
    
    std::vector<double> run() {
        const unsigned n_steps = Ttot_/tau_;
        std::vector<double> energies;
        energies.reserve(n_steps + 1);
        for(unsigned steps = 0; steps < n_steps; ++steps ) {
            energies.push_back(energy(psi_in_));
            step(a_);
            a_ += tau_/Ttot_;
        }

        energies.push_back(energy(psi_out_));
        
        return energies;
    }
    
    void step(double a){
        //compute new couplings due to annealing with param a
        auto new_h(hx_);
        std::transform(hx_.cbegin(),hx_.cend(),new_h.begin(),[this,a](double h) {return h*(1.-a);});
        
        auto new_J(Jz_);
        std::transform(Jz_.cbegin(),Jz_.cend(),new_J.begin(),[this,a](double j) {return j*a;});
        
        
        //step szsz: pass the whole edge set
        using std::swap;
        qsit::time_evolution::szsz_step(psi_in_.begin(), psi_in_.end(), psi_out_.begin(), edges.begin(),edges.end(),new_J.begin(),tau_);
        swap(psi_out_, psi_in_);
        
        //step sx: pass each site separately, then swap and repeat
        for (size_t i = 0; i < sites.size();++i) {
            qsit::time_evolution::sx_step( psi_in_.begin(), psi_in_.end(), psi_out_.begin()
                                         , sites[i], tau_, new_h[i]);
            swap(psi_in_,psi_out_);
        }
    }
    
    double szszenergy(const wf_t& psi) const {
        // E = <Psi|H|Psi>
        //   = <sum_i c_i*psi_i | H | sum_i c_i*psi_i >
        //   = sum_i conj(c_i)*c_i *<psi_i | H | psi_i>
        std::complex<double> energy(0.,0.);
        //for all basis states
        for (config_t ind = 0; ind < psi.size(); ++ind) {
            std::complex<double> coeff = std::conj(psi[ind])*psi[ind];
            std::complex<double> psi_H_psi{0.,0.};
            //for all sites/bonds: parallel = +J/4, antiparallel -J/4
            for (unsigned site = 0; site < N_-1; ++site) {
                if (!(((ind >> site) & config_t(1)) ^ ((ind >> (site+1)) & config_t(1)))) { //if (parallel(site1,site1+1))
                    psi_H_psi += a_*Jz_[site]/4;
                } else {
                    psi_H_psi -= a_*Jz_[site]/4;
                }
            }
            energy += coeff*psi_H_psi;
        }
        if (std::abs(energy.imag()) > 1e-10) {
            std::cerr << "Error in energy computation for szsz";
        }
        return energy.real();
    }
    
    double sxenergy(const wf_t& psi) const {
        //compute H|psi> = sum_i sigma_x^i |psi>
        qsit::wf_t Hpsi(psi.size(),0);
        for (config_t ind = 0; ind < psi.size();++ind) {
            for (unsigned site = 0; site < N_;++site) {
                config_t flipped_state = (ind ^ (1 << site));
                Hpsi[flipped_state]+= (1.-a_)*hx_[site]/2*psi[ind];
            }
        }
        //compute <psi|Hpsi>
        std::complex<double> energy = qsit::util::scalar_product(psi, Hpsi);
        if (energy.imag() > 1e-10) {
            std::cerr << "Error in energy calculation\n";
        }
        
        return energy.real();
    }
    
    
    double energy(const wf_t& psi) const { // E = <psi|H|psi>
        return szszenergy(psi) + sxenergy(psi);
    }

private: // data
    unsigned N_;
    double Ttot_;
    double tau_;
    double a_;               ///< adiabatic param
    std::vector<double> hx_; ///< field in x-direction
    std::vector<double> Jz_; ///< ising coupling
    wf_t psi_out_;
    wf_t psi_in_;
    std::vector<qsit::edge_t> edges;
    std::vector<qsit::site_t> sites;
};

}

int main(int /*argc*/, char *argv[])
{
    model_type& H = wdb::find<model_type>(argc, argv);
    property_type& P = wdb::find<property_type>(argc, argv);
    
    auto& edges = H.get_edges();
    const unsigned N = H.num_nodes();
    
    double hx = P.get_param<double>("hx");     // -1;
    double Ttot = P.get_param<double>("Ttot"); // 500;
    unsigned nsteps = P.get_param<unsigned>("nsweeps"); // 400;

    //perform the annealing
    aqc a(N, edges, Ttot, nsteps, hx);
    auto energies = a.run();
    P.set_cfg(std::vector<std::vector<int>>(), energies);

    return 0;
}
