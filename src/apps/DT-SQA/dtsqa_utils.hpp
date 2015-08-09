/*
 * dtsqa_utils.hpp
 *
 *  Created on: Mar 1, 2015
 *      Author: bettina heim
 */

#ifndef DTSQA_UTILS_HPP_
#define DTSQA_UTILS_HPP_

#include <cassert>
#include <iostream>
#include <vector>
#include <algorithm>

template<typename type>
size_t rename(size_t name, std::vector<size_t>& nrs, std::vector<type>& spins, const type& new_object){

	uint32_t new_name = std::find(nrs.begin(), nrs.end(), name) - nrs.begin();
	if (new_name == nrs.size()){
		nrs.push_back(name);
		spins.push_back(new_object);
	}
	return new_name;

}

void check_and_fill(std::vector<uint32_t>& vect1, uint32_t entry1, std::vector<double>& vect2, double entry2, std::string error_string){

	bool reinitialization = std::find(vect1.begin(), vect1.end(), entry1) != vect1.end();
	if (reinitialization) std::cerr << error_string;
	assert(not reinitialization);
	vect1.push_back(entry1);
	vect2.push_back(entry2);

}


#endif /* DTSQA_UTILS_HPP_ */
