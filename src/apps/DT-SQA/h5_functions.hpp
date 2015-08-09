#ifndef H5_FUNCTIONS_HPP_
#define H5_FUNCTIONS_HPP_

#include "hdf5.h"
#include "H5Cpp.h"
#include <iostream>
#include <vector>
#include <cassert>
#include <string>

hid_t create_or_open_file(std::string filename){

	H5::Exception::dontPrint(); // TODO better way than disabling all error prints?
	const char* path = { filename.c_str() };
	hid_t file_id = H5Fcreate(path, H5F_ACC_EXCL, H5P_DEFAULT, H5P_DEFAULT);
	if (file_id < 0)
		file_id = H5Fopen(path, H5F_ACC_RDWR, H5P_DEFAULT);
	if (file_id < 0)
		std::cerr << "H5Error: Could not open existing file '" << filename << "'.\n";
	return file_id;
}

hid_t  create_or_open_group (std::string groupname, const hid_t file_id){

	hid_t group_id = H5Gcreate(file_id, groupname.c_str(), H5P_DEFAULT, H5P_DEFAULT, H5P_DEFAULT);
	if(group_id < 0)
		group_id = H5Gopen1(file_id, groupname.c_str());
	return group_id;
}

void  create_and_close_group (std::string groupname, const hid_t file_id){

	hid_t group_id = H5Gcreate(file_id, groupname.c_str(), H5P_DEFAULT, H5P_DEFAULT, H5P_DEFAULT);
	if(group_id >= 0)
		H5Gclose(group_id);
}

hid_t create_or_open_dset(std::string dset_name, hid_t group_id, hid_t dtype_id, hid_t dspace_id){ // TODO include creation of necessary groups here

	hid_t dset_id = H5Dcreate (group_id, dset_name.c_str(), dtype_id, dspace_id, H5P_DEFAULT, H5P_DEFAULT, H5P_DEFAULT); // does not throw exception, but returns neg. value on error
	if( dset_id < 0)  // dset already exists or cannot be created
		dset_id = H5Dopen1(group_id, dset_name.c_str());
	return dset_id;
}

template<typename data_type>
herr_t write_and_clean_up(std::string dset_absname, hid_t file_id, hid_t dtype_id, hid_t dspace_id, data_type*  data){

	hid_t dset_id = create_or_open_dset(dset_absname, file_id,  dtype_id, dspace_id);
	herr_t status = H5Dwrite (dset_id, dtype_id, H5S_ALL, H5S_ALL, H5P_DEFAULT, data);
	H5Dclose (dset_id);
	H5Sclose (dspace_id);
	H5Tclose (dtype_id);
	return status;
}

hid_t  get_H5id_for_vectorvectorint_dtype(const std::vector<std::vector<int>>& vect){ // or alternatively with H5T_NATIVE_INT
	// works for 'non-square' data structures as well
	int mem_size = 0;
	for (size_t t = 0; t < vect.size(); ++t)
		mem_size += 4 * vect[t].size();

	hid_t H5t_optimal_tour_id = H5Tcreate (H5T_COMPOUND,  mem_size); // filetype
	mem_size = 0;
	for (size_t i = 0; i < vect.size(); ++i){
		std::string name = "v";
		hsize_t dim_opt_tour[1] = {vect[i].size()};
		H5Tinsert (H5t_optimal_tour_id, name.append( std::to_string(i)).c_str(), mem_size,  H5Tarray_create(H5T_NATIVE_INT, 1, dim_opt_tour));
		mem_size += 4 * vect[i].size();
	}
	return H5t_optimal_tour_id;
}

#define FUNCTION(x) \
	hid_t get_H5id_for_2Darray_NATIVE_##x##_dtype(const size_t size1, const size_t size2=0){ \
		hsize_t N1 = size1; \
		hsize_t N2 = (size2 == 0? size1 : size2); \
		hsize_t dims[2] = {N1,N2}; \
		return H5Tarray_create(H5T_NATIVE_##x, 2, dims); \
	}

	FUNCTION(DOUBLE)
	FUNCTION(INT)
#undef FUNCTION

#define FUNCTION(x) \
	hid_t get_H5id_for_1Darray_NATIVE_##x##_dtype(const size_t size){ \
		hsize_t N = size; \
		hsize_t dim[1] = {N}; \
		return H5Tarray_create(H5T_NATIVE_##x, 1, dim); \
	}

	FUNCTION(DOUBLE)
	FUNCTION(INT)
#undef FUNCTION

hid_t get_H5id_for_1Darray_dspace(hsize_t size){
	hsize_t dim[1] = {size};
	return H5Screate_simple (1, dim, NULL);
}

template<typename base_type>
std::vector<base_type>  convert_to_1D( const std::vector<std::vector<base_type>>& vect2D){
	std::vector<base_type> vect1D;
	for (size_t i =0; i <  vect2D.size(); ++i)
		vect1D.insert(vect1D.end(), vect2D[i].begin(), vect2D[i].end());
	return vect1D;
}

template<typename base_type>
std::vector<std::vector<base_type>> convert_to_2D( const std::vector<base_type>& vect1D, const size_t nr_rows){

	size_t nr_columns = vect1D.size() / nr_rows;
	std::vector<std::vector<base_type>> vect2D(nr_rows);
	size_t index = 0;
	for (size_t i = 0; i < nr_rows; ++i,  index+= nr_columns)
			//vect2D.push_back(std::vector<base_type>(&vect1D[index],&vect1D[index + nr_columns]));
		vect2D[i] = std::vector<base_type>(&vect1D[index],&vect1D[index + nr_columns]);
	if(index < vect1D.size())
		std::cerr << "Warning: Size of vector not divisible by given number of rows in call to 'convert_to_2D', data may be lost.";
	return vect2D;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

template<typename dtype>
void get_data(hid_t file_id, std::string dset_name, hid_t dtype_id, dtype* buffer){

	hid_t dset_id = H5Dopen (file_id, dset_name.c_str(), H5P_DEFAULT);
	hid_t dspace_id = H5Dget_space (dset_id);

	H5Dread (dset_id, dtype_id, H5S_ALL, H5S_ALL, H5P_DEFAULT, buffer);

	H5Dclose (dset_id);
	H5Sclose (dspace_id);
	H5Tclose (dtype_id);
}

template<typename base_type>
void get_data(hid_t file_id, std::string dset_name, hid_t dtype_id, size_t dtype_size, std::vector<std::vector<base_type>>& data){

	hid_t dset_id = H5Dopen (file_id, dset_name.c_str(), H5P_DEFAULT);
	hid_t dspace_id = H5Dget_space (dset_id);
	hsize_t dim;
	H5Sget_simple_extent_dims(dspace_id, &dim, NULL); // see also H5Sget_simple_extent_dims
	std::vector<base_type> buffer(dim*dtype_size);
	H5Dread (dset_id, dtype_id, H5S_ALL, H5S_ALL, H5P_DEFAULT, &buffer[0]);
	data = convert_to_2D(buffer, dim);
	H5Dclose (dset_id);
	H5Sclose (dspace_id);
	H5Tclose (dtype_id);
}

herr_t add_name(hid_t file_id, const char* group_name, const H5L_info_t* link_info, void* vect_str_arg){
	std::vector<std::string>* vect_ptr = static_cast<std::vector<std::string>*>(vect_str_arg);
	(*vect_ptr).push_back(group_name);
	return 0;
}

herr_t get_group_names(const hid_t group_id, std::vector<std::string>& group_names, bool absolute_path = false){
	H5Literate(group_id, H5_INDEX_NAME, H5_ITER_NATIVE, NULL, add_name, &group_names);
	if(absolute_path){
		char parent_group_name[1024];
		H5Iget_name(group_id, parent_group_name, 1024); //1024: maximum length of the name
		for (size_t i = 0; i < group_names.size(); ++i)
			group_names[i] = (std::string)(parent_group_name) + std::string("/") + group_names[i];
	}
	return 0;
}


#endif
