/*
 * schedule.hpp
 *
 *  Created on: Mar 20, 2015
 *      Author: bettina
 */

#ifndef SCHEDULE_HPP_
#define SCHEDULE_HPP_

#include "parameters.hpp"

struct Schedule{

	private:

		std::pair<double,double> inverse_temperature; // current value for beta and stepsize for beta
		std::pair<double,double> transverse_field; // current value for gamma and stepsize for gamma

		void update_temperature(){ inverse_temperature.first += inverse_temperature.second; }
		void update_transverse_field(){ transverse_field.first += transverse_field.second; }

	public:

		Schedule(const Parameters& param)
		: inverse_temperature(param.beta.first, (param.beta.second - param.beta.first) / (param.nr_MCS -1))
		, transverse_field(param.gamma.first, (param.gamma.second - param.gamma.first) / (param.nr_MCS -1)){}


		void update(){
			update_temperature();
			update_transverse_field();
		}
		double get_transverse_field(){ return transverse_field.first; }
		double get_inverse_temperature(){ return inverse_temperature.first; }

};


#endif /* SCHEDULE_HPP_ */
