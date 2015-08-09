/*
 * simulation_detail.hpp
 *
 *  Created on: Mar 1, 2015
 *      Author: bettina heim
 */

#ifndef SIMULATION_HPP_
#define SIMULATION_HPP_

#include <vector>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <cassert>
#include <iostream>
#include <numeric>
#include "definitions.hpp"
#include "dtsqa_utils.hpp"

// input file of the form "spin1 spin2 ... coupling"
template<class base_type>
void Simulation<base_type>::read_lattice_wdb(const wdb::entities::ising::model& H, std::vector<double>& h_field, size_t nr_ts){

	std::vector<size_t> site_nr; // fixme: don't rename spins or save map how spins have been renamed
	for (const auto& edge : H.get_edges()) {

		std::vector<size_t> neighbors;
		for (auto& site : edge.first){
			uint32_t current_site = rename(site, site_nr, spin, SpinProperties(nr_ts));
			if(site_nr.size() != h_field.size()) h_field.push_back(0);
			assert(site_nr.size() == h_field.size());
			neighbors.push_back(current_site);
		}

		double coupling = edge.second;

		if (neighbors.size() == 0){ std::cout << "formatting error"; exit(-1); }
		if (neighbors.size() == 1){
			assert("error in spin properties initialization: re-initialization of on-site fields" && h_field[neighbors[0]] == 0);
			h_field[neighbors[0]] = coupling;
		} else {
			std::shared_ptr<InteractionSet> ptr = std::make_shared<InteractionSet>(coupling, neighbors);
			for (size_t nb : neighbors)
				spin[nb].interactions.push_back(ptr);
		}

	}

	if (spin.size() == 0)
		throw std::runtime_error("lattice file is either empty or has the wrong format");
}

// input file of the form "spin1 spin2 ... coupling"
template<class base_type>
void Simulation<base_type>::read_lattice_file(std::string lattice_file, std::vector<double>& h_field, size_t nr_ts){

	std::ifstream input_file;
	input_file.open(lattice_file.c_str(), std::ios_base::in);
	if (!input_file)
		throw std::runtime_error("cannot open file " + lattice_file);

	std::vector<size_t> site_nr; // fixme: don't rename spins or save map how spins have been renamed
	for(uint64_t line_nr = 0; input_file; ++line_nr){
		std::string line;
		getline(input_file, line);

		if (line.empty() || line[0] == '#') continue;
		// todo: maybe strip regex

		std::istringstream iss(line);
		std::vector<std::string> entries;
		std::string entry;
		while(iss >> entry)
			entries.push_back(entry);

		double coupling = std::stod(entries.back());
		entries.pop_back();

		std::vector<size_t> neighbors;
		for (auto& site_str : entries){
			size_t site = std::stoi(site_str);
			uint32_t current_site = rename(site, site_nr, spin, SpinProperties(nr_ts));
			if(site_nr.size() != h_field.size()) h_field.push_back(0);
			assert(site_nr.size() == h_field.size());
			neighbors.push_back(current_site);
		}

		if (neighbors.size() == 0){ std::cout << "formatting error in line " + std::to_string(line_nr); exit(-1); }
		if (neighbors.size() == 1){
			assert("error in spin properties initialization: re-initialization of on-site fields" && h_field[neighbors[0]] == 0);
			h_field[neighbors[0]] = coupling;
		} else {
			std::shared_ptr<InteractionSet> ptr = std::make_shared<InteractionSet>(coupling, neighbors);
			for (size_t nb : neighbors)
				spin[nb].interactions.push_back(ptr);
		}

	}

	if (spin.size() == 0)
		throw std::runtime_error("lattice file is either empty or has the wrong format");
}

template<class base_type>
void Simulation<base_type>::calculate_hde(const std::vector<double>& h_field){

	for(size_t i = 0; i < spin.size(); ++i){
		size_t ts = 0;
		for (size_t b = 0; b < spin[i].state.size(); ++b){
			for (size_t d = 0; ts < spin[i].h_de.size() && d < base_type_bitsize; ++d, ++ts){
				spin[i].h_de[ts] = spin[i].state[b] & (static_cast<base_type>(1) << d) ? h_field[i] : -h_field[i];
				for (auto setptr : spin[i].interactions){
					double coupling = (*setptr).first;
					for(size_t nb : (*setptr).second)
						coupling = (spin[nb].state[b] & (static_cast<base_type>(1) << d) ? coupling : -coupling);
					spin[i].h_de[ts] += coupling;
				}
			}
		}
	}
}

template<class base_type>
double Simulation<base_type>::get_energies(std::vector<double>& ts_energies) const {

	size_t nr_ts = spin[0].h_de.size();
	std::vector<double>(nr_ts).swap(ts_energies);
	for(size_t i = 0; i < spin.size(); ++i){
		for (size_t ts = 0; ts < nr_ts; ++ts)
			ts_energies[ts] += spin[i].h_de[ts];
	}
	std::transform(ts_energies.begin(), ts_energies.end(), ts_energies.begin(), [](double x){return -0.5 * x;} );
	return std::accumulate(ts_energies.begin(), ts_energies.end(), 0.) / ts_energies.size();
}

template<class base_type>
void Simulation<base_type>::update_neighbor(size_t site, size_t nb, double two_couplings, std::vector<base_type> updates, const std::vector<base_type>& alignment){

	double energy_update[3] = {0, -two_couplings, two_couplings};
	for(uint32_t block = 0; block < updates.size(); ++block){
		uint32_t ts = block * base_type_bitsize; // fixme: get rid of multiplication
		for (base_type sign = alignment[block]; updates[block] != 0; updates[block] >>= 1, sign >>=1)
			spin[nb].h_de[ts++] += energy_update[ (updates[block] & 1) ? 1 + (sign & 1) : 0];
	}
}

template<class base_type>
void Simulation<base_type>::update_site(size_t site, std::vector<base_type>& updates){

	for(std::shared_ptr<InteractionSet> iptr : spin[site].interactions){
		std::vector<base_type> alignment(updates.size());
		for(auto nb : (*iptr).second){ // neighbors = spins that couple
			for (size_t block = 0; block < updates.size(); ++block)
				alignment[block] ^= spin[nb].state[block]; // todo: maybe save and update alignment (makes sense if a lot of spins couple)
		}
		for(auto nb : (*iptr).second){
			if (nb == site) continue;
			update_neighbor(site, nb, 2*(*iptr).first, updates, alignment);
		}
	}

	std::transform(spin[site].state.begin(), spin[site].state.end(), updates.begin(), spin[site].state.begin(), std::bit_xor<base_type>());
	//for(uint32_t ts = 0; ts < spin[site].h_de.size(); updates[ts++ >> 6] >>= 1)
		//spin[site].h_de[ts] = (updates[ts >> 6]  & 1) ? -spin[site].h_de[ts] : spin[site].h_de[ts];

	for(uint32_t block = 0; block < updates.size(); ++block){
		for(uint32_t ts = block * base_type_bitsize; updates[block] != 0; updates[block] >>= 1, ++ts)// fixme: get rid of multiplication
			spin[site].h_de[ts] = (updates[block] & 1) ? -spin[site].h_de[ts] : spin[site].h_de[ts];
	}
}


#endif /* SIMULATION_HPP_ */
