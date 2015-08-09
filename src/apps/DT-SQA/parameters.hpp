/*
 * parameters.hpp
 *
 *  Created on: Mar 1, 2015
 *      Author: bettina heim
 */

#ifndef PARAMETERS_HPP_
#define PARAMETERS_HPP_


struct Parameters // fixme: tau and nr_blocks are not needed
{
  uint64_t nr_MCS;
  std::pair<double,double> beta; // start and end value of the inverse temperature
  std::pair<double,double> gamma; // start and end value of the transverse field
  uint32_t nr_ts;
  uint32_t nr_blocks;


  Parameters(uint64_t MCS,  int M, double Bstart, double Bend, double Gstart, double Gend)
  : nr_MCS(MCS)
  , beta(Bstart, Bend)
  , gamma(Gstart, Gend)
  , nr_ts(M)
  , nr_blocks((M-1)/64 +1){
  };

};

#endif /* PARAMETERS_HPP_ */
