/*
 * process_arguments_detail.hpp
 *
 *  Created on: Nov 28, 2014
 *      Author: bettina heim
 */

#ifndef PROCESS_ARGUMENTS_DETAIL_HPP_
#define PROCESS_ARGUMENTS_DETAIL_HPP_

#include <string>

namespace Args_detail {
    template <class return_type>
    return_type find_arg_value (const std::string key, std::vector<std::string>* arg_keys, std::vector<std::string>* arg_values);

    template<> std::string find_arg_value (const std::string key, std::vector<std::string>* arg_keys, std::vector<std::string>* arg_values) {
		size_t index = 0;
		while ((*arg_keys)[index] != key && ++index < (*arg_keys).size());
		if (index == (*arg_keys).size()){
			std::string error_string = "Error: key '";
			error_string.append(key).append("' not found in arg_keys.\nPossible formats for arguments are:\n\targ_key1 arg_value1 arg_key2 arg_value2 ...\n\targ_key1=arg_value1 arg_key2=arg_value2 ...(no white spaces)\n");
			throw (std::runtime_error(error_string));
		}
		return (std::string) (*arg_values)[index];
    }

	#define TEMPLATE_CODE(type, string_to_value) \
		\
    template<> type find_arg_value (const std::string key, std::vector<std::string>* arg_keys, std::vector<std::string>* arg_values) { \
		\
    	std::string s_value = Args_detail::find_arg_value<std::string>(key, arg_keys, arg_values); \
    	type value; \
    	try{ \
    		string_to_value; \
    	}catch(...){ \
    		std::cerr << "Error: Could not convert command line argument into requested type." << std::endl; \
    		throw; \
    	} \
    	return  value; \
    }

    TEMPLATE_CODE( int, value = std::atoi(s_value.c_str()) )
    TEMPLATE_CODE( uint64_t, value = strtoull(s_value.c_str(), NULL, 0) )
    TEMPLATE_CODE( uint32_t, value = strtoull(s_value.c_str(), NULL, 0) )
    TEMPLATE_CODE( double, value = std::atof(s_value.c_str()) )
    TEMPLATE_CODE( float, value = std::atof(s_value.c_str()) )

	#undef TEMPLATE_CODE

}


#endif /* PROCESS_ARGUMENTS_DETAIL_HPP_ */
