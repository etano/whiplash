#include "process_arguments.hpp"
#include "parameters.hpp"
#include "simulation.hpp"
#include "algorithm.hpp"
#include "schedule.hpp"
#include <cmath>
#include <limits>

#include <iostream> // fixme: remove
using namespace std;

template<class base_type>
void anneal(Simulation<base_type>& sim, const Parameters& param, uint32_t seed, bool periodic){ // periodic: use periodic boundary conditions in imaginary time

	Schedule schedule(param);
	Algorithm<base_type> alg(param.nr_ts, schedule.get_inverse_temperature(), seed, periodic);

	for (uint64_t ts = 0; ts < param.nr_MCS; ++ts){
		double tau = alg.set_inverse_temperature(schedule.get_inverse_temperature()); // tau = beta/nr_ts
		double probability_for_cluster_breakup = tanh(tau * schedule.get_transverse_field());
		alg.sample_states(sim, probability_for_cluster_breakup);
		schedule.update();
	}

}

int main(int argc, char* argv[]){

	cout << "starting...\n"; // todo: remove

	// whiplashdb input
	wdb::entities::ising::model& H = wdb::find<wdb::entities::ising::model>(argv);
	wdb::entities::ising::property& P = wdb::find<wdb::entities::ising::property>(argv);

	uint32_t seed = P.get_seed();
	bool periodic = P.get_param<int>("periodic") or P.optional_set_param<int>("periodic",1);
	uint32_t nr_ts = P.get_param<uint32_t>("nslices");
	uint64_t nr_MCS = P.get_param<uint64_t>("nsweeps");
	double g0 = P.get_param<double>("gamma_0");
	double ge = P.get_param<double>("gamma_1");

	double t0 = P.get_param<double>("T_0");
	double te = P.get_param<double>("T_1");
	if (t0 == 0 || te == 0) cerr << "Warning: replaced the given temperature 0 by a value of 1e-8." << endl;
	double b0 = t0 == 0 ? 1.e8 : 1/t0;
	double be = te == 0 ? 1.e8 : 1/te;

	Parameters param(nr_MCS, nr_ts, b0, be, g0, ge);
	Simulation<> sim(H, seed, nr_ts);
	anneal(sim, param, seed, periodic);

	// whiplashdb output
	std::vector<double> energies;
	auto av_energy = sim.get_energies(energies);
	P.set_cfg(sim.get_cfgs(),energies);

	cout << "\nok" << endl; // todo: remove
	return 0;
}

