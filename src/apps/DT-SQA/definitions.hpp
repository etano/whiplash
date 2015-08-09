/*
 * dtsqa_declarations.h
 *
 *  Created on: Mar 1, 2015
 *      Author: bettina heim
 */

#ifndef DTSQA_DEFINITIONS_HPP_
#define DTSQA_DEFINITIONS_HPP_

#include <climits>
#include <random>
#include <algorithm>
#include <memory>
#include "wdb.hpp"

template<class base_type = uint64_t>
class Simulation{

	typedef std::pair<double, std::vector<size_t>> InteractionSet;

	private:

		struct SpinProperties{

			std::vector<base_type> state;
			std::vector<std::shared_ptr<InteractionSet>> interactions; // interactions are saved as pair(coupling, spins which couple) and the vector contains all entries where spin i occurs
			std::vector<double> h_de;

			SpinProperties(uint32_t nr_trotter_slices)
			: state((nr_trotter_slices-1)/(sizeof(base_type) * CHAR_BIT) +1) // nr_blocks needed
			, h_de(nr_trotter_slices){}
		};

		std::vector<SpinProperties> spin;

	public:

		const uint32_t base_type_bitsize;
		const std::string simulation_id;

		void read_lattice_wdb(const wdb::entities::ising::model& H, std::vector<double>& h_field, size_t nr_ts);

		void read_lattice_file(std::string, std::vector<double>&, size_t);
		void calculate_hde(const std::vector<double>&);

		Simulation(const wdb::entities::ising::model& H, uint32_t& seed, size_t nr_ts)
		: base_type_bitsize(sizeof(base_type) * CHAR_BIT) // 1byte = sizeof(char) but sizeof(char) not necessarily 8bits according to c++ standards
		, simulation_id(std::to_string(seed)){
			std::vector<double> h_fields;
			read_lattice_wdb(H, h_fields, nr_ts);
			std::mt19937_64 random(seed); // fixme: maybe use a distribution to get a random int with a suitable nr of bits...
			for(size_t i = 0; i < spin.size(); ++i){
				std::generate(spin[i].state.begin(), spin[i].state.end(), random);
				random.seed(spin[i].state.back());
			}
			seed = random();
			calculate_hde(h_fields);
		}

		Simulation(std::string lattice_file, uint32_t& seed, size_t nr_ts)
		: base_type_bitsize(sizeof(base_type) * CHAR_BIT) // 1byte = sizeof(char) but sizeof(char) not necessarily 8bits according to c++ standards
		, simulation_id(std::to_string(seed)){
			std::vector<double> h_fields;
			read_lattice_file(lattice_file, h_fields, nr_ts);
			std::mt19937_64 random(seed); // fixme: maybe use a distribution to get a random int with a suitable nr of bits...
			for(size_t i = 0; i < spin.size(); ++i){
				std::generate(spin[i].state.begin(), spin[i].state.end(), random);
				random.seed(spin[i].state.back());
			}
			seed = random();
			calculate_hde(h_fields);
		}

		size_t nr_of_spins(){ return spin.size(); }
		const std::vector<base_type>& get_spin_state(size_t index) const{ return spin[index].state; }
		const std::vector<std::vector<base_type>> get_cfgs() const{
			std::vector<std::vector<base_type>> cfgs;
			size_t nr_ts = spin[0].h_de.size();
			for(size_t ts = 0; ts < nr_ts; ++ts){
				std::vector<base_type> cfg;
				for(size_t i = 0; i < spin.size(); ++i)
					cfg.push_back(spin[i].state[ts]);
				cfgs.push_back(cfg);
			}
			return std::move(cfgs);
		}

		std::vector<base_type> get_alignment(size_t, size_t);
		void update_neighbor(size_t, size_t, double, std::vector<base_type>, const std::vector<base_type>&);
		void update_site(size_t, std::vector<base_type>&);
		double get_energy_difference(size_t site, size_t start_index, size_t end_index){
			return std::accumulate(spin[site].h_de.begin() + start_index, spin[site].h_de.begin() + end_index, 0.);
		}
		double get_energy_difference(size_t site, size_t start_index){
			return std::accumulate(spin[site].h_de.begin() + start_index, spin[site].h_de.end(), 0.);
		}
		double get_energies(std::vector<double>& ts_energies) const;

};


#endif /* DTSQA_DEFINITIONS_HPP_ */
