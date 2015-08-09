/*
 * process_arguments.hpp
 *
 *  Created on: Nov 28, 2014
 *      Author: bettina heim
 */

#ifndef PROCESS_ARGUMENTS_HPP_
#define PROCESS_ARGUMENTS_HPP_

#include <string>
#include <vector>
#include <stdexcept>
#include <iostream>
#include <cassert>
#include <cstdlib>
#include "string.h"
#include "process_arguments_detail.hpp"

class Arguments{

	std::vector<std::string> arg_keys;
	std::vector<std::string> arg_values;
	std::string compulsory_arguments;
	std::string optional_arguments;

public:

	Arguments()
	: compulsory_arguments("Not defined (initialized without defaults)")
	, optional_arguments("Not defined (initialized without defaults)")
	{}

	Arguments(std::string defaults){

		const char* word = &defaults[0];
		size_t cnt = 0;
		while(cnt < defaults.length()){
			while (word[cnt] == ' ' || word[cnt] == (char)',' ) ++cnt;
			size_t start = cnt;
			while (cnt < defaults.length() &&word[cnt] != (char)'=' && word[cnt] != (char)' '  && word[cnt] != (char)',' ) ++cnt;
			arg_keys.push_back(defaults.substr(start, cnt - start));
			while (cnt < defaults.length() && (word[cnt] == ' ' || word[cnt] == (char)',')) ++cnt;
			if (cnt == defaults.length() || word[cnt]!= (char)'='){
				arg_values.push_back("");
				continue;
			}
			while (word[cnt] == ' ' || word[cnt] == (char)'=' || word[cnt] == (char)',') ++cnt;
			if (word[cnt] == (char)','){
				arg_values.push_back("");
				continue;
			}
			start = cnt;
			while (cnt < defaults.length() && word[cnt] != (char)' ' && word[cnt] != (char)',') ++cnt;
			arg_values.push_back(defaults.substr(start, cnt - start));
			while (cnt < defaults.length() && ( word[cnt] == ',' || word[cnt]== (char)' ') ) ++cnt;
		}
		assert (arg_keys.size() == arg_values.size());

		compulsory_arguments = "Compulsory arguments are: ";
		optional_arguments = "Optional argments are: ";
		for (size_t i = 0; i < arg_keys.size(); ++i){
			if(arg_values[i] != ""){
				optional_arguments.append(arg_keys[i]).append(" (default: ").append(arg_values[i]).append("), ");
			} else
				compulsory_arguments.append(arg_keys[i]).append(", ");
		}
	}

	void set(std::string defaults){
		Arguments a(defaults);
		*this = a;
	}

	void add(std::string defaults){
		Arguments a(defaults);
		arg_keys.insert( arg_keys.end(), a.arg_keys.begin(), a.arg_keys.end() );
		arg_values.insert( arg_values.end(), a.arg_values.begin(), a.arg_values.end() );
		compulsory_arguments += a.compulsory_arguments.substr(std::string("Compulsory arguments are: ").length());
		optional_arguments += a.optional_arguments.substr(std::string("Optional arguments are: ").length());
	}

	template <class return_type>
	return_type find_arg_value(const std::string key) {
		return Args_detail::find_arg_value<return_type>(key, &arg_keys, &arg_values);
	}

	#define MIN(a,b) a < b? a : b
	void process_arguments(int argc, char* argv[]){  // TODO: make this one nicer...!

		if (arg_keys.size()==0)
			throw std::runtime_error ("Error on call to function 'process_arguments': No possible command line arguments have been declared.\n");
		if(argc == 2 && (strcmp(argv[1], "--help") == 0)){
			print();
			exit(0);
		}

		const char* eq = "=";
		std::string error_string = "Unknown format of command line arguments: Missing argument value.\nPossible formats are:\n\targ_key1 arg_value1 arg_key2 arg_value2 ...\n\targ_key1=arg_value1 arg_key2=arg_value2 ...\n\targ_key1 = arg_value1 arg_key2 = arg_value2 ... \n";
		bool print_possible_arguments=false;
		for (int i = 1; i < argc; ++i){
			unsigned int index = 0;
			std::string argi = argv[i];
			while (argi.compare(0, MIN(arg_keys[index].length(), argi.length()), arg_keys[index] ) != 0  && ++index < arg_keys.size());
			if (index == arg_keys.size()){
				std::cerr << "Unknown argument, ignore command line argument '" << argi << "'" << std::endl;
				print_possible_arguments = true;
			} else {
				if (argi.length() == arg_keys[index].length()){
					if (++i < argc){
						argi = argv[i];
						if( strcmp(eq, argv[i]) != 0){
							arg_values[index] = argi.substr( argi.compare(0,1,"=") == 0 );
						}
						else if (++i < argc)
							arg_values[index] = argv[i];
						else{
							error_string.append("Arguments set so far:\n");
							for (unsigned int j = 0; j < arg_keys.size(); ++j)
								error_string.append("\targument '").append(arg_keys[j]).append("' set to '").append(arg_values[j]).append("'\n");
							throw(std::runtime_error(error_string));
						}
					}
					else{
						error_string.append("Arguments set so far:\n");
						for (unsigned int j = 0; j < arg_keys.size(); ++j)
							error_string.append("\targument ").append(arg_keys[j]).append(" set to ").append(arg_values[j]).append("\n");
						throw(std::runtime_error(error_string));
					}
				}
				else{
					if (argi[arg_keys[index].length()] != '='){
						// maybe there is another key with the same beginning
						++index;
						while (argi.compare(0, MIN(arg_keys[index].length(), argi.length()), arg_keys[index] ) != 0  && ++index < arg_keys.size());
						if (index == arg_keys.size()){
							std::cerr << "Unknown argument, ignore command line argument '" << argi << "'" << std::endl;
							print_possible_arguments = true;
						}
					} else {
						if (argi.length() <= arg_keys[index].length() + 1){
							if (++i < argc)
								arg_values[index] = argv[i];
							else{
								error_string.append("Arguments set so far:\n");
								for (unsigned int j = 0; j < arg_keys.size(); ++j)
									error_string.append("\targument ").append(arg_keys[j]).append(" set to ").append(arg_values[j]).append("\n");
								throw(std::runtime_error(error_string));
							}
						}else
							arg_values[index] = argi.substr(arg_keys[index].length()+1, argi.length() - (arg_keys[index].length()+1));
					}
				}
			}
		}
		if (print_possible_arguments)
			std::cerr << "\n" << compulsory_arguments << "\n" << optional_arguments  << std::endl;
		assert (arg_keys.size() == arg_values.size());

		std::string missing = "Missing argument '";
		for (size_t i = 0; i < arg_keys.size(); ++i){
			if (arg_values[i] == ""){
				missing.append(arg_keys[i]).append("'\n");
				if (not print_possible_arguments) missing.append(compulsory_arguments).append("\n").append(optional_arguments);
				throw(std::runtime_error(missing));
			}
		}
	}
	#undef MIN

	void print(){

		std::string arguments = "Possible argument keys and their currently set values are:\n";
		for (size_t i = 0; i < arg_keys.size(); ++i)
			arguments.append(arg_keys[i]).append(" (value: ").append(arg_values[i]).append("), ");
		std::cout << arguments << std::endl;
	}

}Args;


#endif  /* PROCESS_ARGUMENTS_HPP_ */

