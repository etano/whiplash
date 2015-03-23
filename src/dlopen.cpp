#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>
#include <stdexcept>

// Example:
//
// icpc -fPIC -shared fib.cpp -o fib.app
// icpc dlopen.cpp

class Application {
public:
    Application(const char* path){
        handle = dlopen(path, RTLD_NOW);
        if(!handle) throw std::runtime_error("Error: cannot open shared object!");
        dlerror(); // reset errors
        fptr = dlsym(handle, "main");
        if(dlerror()) throw std::runtime_error("Error: cannot load symbol!");
    }
   ~Application(){
        dlclose(handle);
    }
    void operator()(int argc, char** argv){
        typedef int (*fptr_t)(int,char**);
        ((fptr_t)fptr)(argc, argv);
    }
    void operator()(){
        typedef int (*fptr_t)();
        ((fptr_t)fptr)();
    }
private:
    void* handle;
    void* fptr;
};

int main(int argc, char** argv){

    Application fib("fib.app");
    for(int i = 0; i < 1000; i++)
        fib(argc, argv);

    return 0;
}
