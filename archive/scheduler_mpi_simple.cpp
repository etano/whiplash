#include <stdlib.h>
#include <string>
#include <cassert>
#include <fstream>
#include <iostream>
#include <unistd.h>
#include <dirent.h>
#include <mpi.h>

inline bool empty_dir(const char* dir_name)
{
  DIR* dir(opendir(dir_name));
  assert(dir != NULL);
  unsigned n(0);  
  while(readdir(dir) != NULL){
    if(++n > 2){
      closedir(dir);
      return false;
    }
  }
  closedir(dir);
  return true;
}

int main(int argc, char* argv[])
{
  int world_rank;
  MPI_Init(&argc, &argv);
  MPI_Comm_rank(MPI_COMM_WORLD, &world_rank);

  while(!empty_dir("run")){
    const std::string command = "file=$(ls run |sort -R | head -n 1) && command=$(cat run/${file}) && rm run/${file} && ${command}";
    system(command.c_str());
    usleep(1e05 * world_rank);
  }

  MPI_Finalize();

  return 0;
}
