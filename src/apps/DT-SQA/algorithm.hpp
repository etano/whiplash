/*
 * algorithm.hpp
 *
 *  Created on: Mar 1, 2015
 *      Author: bettina heim
 */

#ifndef DTSQA_ALGORITHM_HPP_
#define DTSQA_ALGORITHM_HPP_
#include <vector>
#include <limits>
#include "randombits.hpp"
#include "bititerator.hpp"
#include "fastmath.hpp"


template <class base_type>
class Algorithm{

	private:

		const uint32_t base_type_bitsize;
		const uint32_t size_last_block;
		Randombits<base_type> bit_distribution;
		std::vector<base_type> formed_clusters;
		std::vector<base_type> updates;
		fastmath::exp< true, 12 > fexp; // 12: precision of error correction
		mutable std::mt19937 rnd32_generator; // 32 bit random ints, mersenne twister-> fixme: take something more efficient
		base_type (Algorithm::*get_rel_orientation_first_block)(const std::vector<base_type>&);
		std::pair<size_t, double> coefficients; // contains the number of Trotter slices and the inverse temperature

		base_type rel_orientation_periodic(const std::vector<base_type>& spin_state){
			base_type periodic_shift = (spin_state.back() >> ( size_last_block - 1 )) & 1;
			return (spin_state[0] ^ ((spin_state[0] << 1) | periodic_shift));
		}

		base_type rel_orientation_nonperiodic(const std::vector<base_type>& spin_state){
			return (spin_state[0] ^ (spin_state[0] << 1)) | 1;
		}

		size_t index(std::pair<size_t, unsigned int> point){
			return (point.first * base_type_bitsize) | point.second;// todo: * compiler optimized?
		}

	public:

		Algorithm(size_t nr_ts, double inv_temp, uint32_t seed, bool periodic)
		: base_type_bitsize(sizeof(base_type) * CHAR_BIT) // 1byte = sizeof(char) but sizeof(char) not necessarily 8bits according to c++ standards
		, size_last_block((nr_ts & (base_type_bitsize-1)) == 0 ? base_type_bitsize : (nr_ts & (base_type_bitsize-1)))
		, bit_distribution()
		, formed_clusters((nr_ts-1)/base_type_bitsize +1)
		, updates(formed_clusters.size())
		, coefficients(nr_ts, inv_temp){
			rnd32_generator.seed(seed);
			fexp.set_coefficient(2 * inv_temp / nr_ts); // factor 2 as we only half the energy difference h_de is saved and updated
			get_rel_orientation_first_block = periodic? &Algorithm::rel_orientation_periodic : &Algorithm::rel_orientation_nonperiodic;
		}

		double set_inverse_temperature(double inv_temp){
			double tau = inv_temp / coefficients.first;
			if (inv_temp != coefficients.second) fexp.set_coefficient(2 * tau);
			return tau;
		}

		void form_bonds(const Simulation<base_type>&, size_t spin);
		void sample_states(Simulation<base_type>&, double);
		void add_spins_to_update(std::pair<size_t, unsigned int>, const std::pair<size_t, unsigned int>&);

};


template<class base_type>
void Algorithm<base_type>::form_bonds(const Simulation<base_type>& sim, size_t site){

	for (size_t i = 0; i < formed_clusters.size(); ++i)
		formed_clusters[i] = bit_distribution(rnd32_generator);
	const std::vector<base_type>& spin_state = sim.get_spin_state(site);

	formed_clusters[0] |= (this->*get_rel_orientation_first_block)(spin_state);
	for (size_t i = 1; i < formed_clusters.size(); ++i)
		formed_clusters[i] |= (  spin_state[i] ^ ( (spin_state[i] << 1) | (spin_state[i-1] >> (base_type_bitsize-1)) )  );
}

template<class base_type>
void Algorithm<base_type>::add_spins_to_update(std::pair<size_t, unsigned int> start, const std::pair<size_t, unsigned int>& end){

	if (start.first == end.first){
		updates[start.first] ^= (end.second == base_type_bitsize? 0 : (static_cast<base_type>(1) << end.second)) - (static_cast<base_type>(1) << start.second); // fixme: make more efficient
		return;
	}
	updates[start.first] ^=  - (static_cast<base_type>(1) << start.second);
	while(++start.first < end.first)
		updates[start.first] ^= ~static_cast<base_type>(0);
	updates[end.first] ^= (end.second == base_type_bitsize ? ~static_cast<base_type>(0) : (static_cast<base_type>(1) << end.second) -1);
}

template<class base_type>
void Algorithm<base_type>::sample_states(Simulation<base_type>& sim, double probability){

	std::uniform_real_distribution<double> drand(0,1);
	bit_distribution.param(probability);
	for (size_t site = 0; site < sim.nr_of_spins(); ++site){

		form_bonds(sim, site);

		BitIterator<base_type> breaks(formed_clusters, std::pair<size_t, unsigned int>(formed_clusters.size(), size_last_block));
		std::pair<size_t, unsigned int> first_break = *breaks;
		std::pair<size_t, unsigned int> last_break = *(breaks++);

		while ( *breaks != breaks.END){
			double energy_difference = sim.get_energy_difference(site, index(last_break), index(*breaks));
			if ( drand(rnd32_generator) <= fexp(-energy_difference) )
				add_spins_to_update(last_break, *breaks);
			last_break = *(breaks++);  // index, at which cluster starts
		}

		double energy_difference = sim.get_energy_difference(site, index(last_break)) + sim.get_energy_difference(site, 0, index(first_break));
		if ( drand(rnd32_generator) <= fexp(-energy_difference) ){
			add_spins_to_update(last_break, breaks.END);
			add_spins_to_update(std::pair<size_t, unsigned int>(0,0), first_break);
		}

		sim.update_site(site, updates);
	}
}


#endif /* DTSQA_ALGORITHM_HPP_ */
