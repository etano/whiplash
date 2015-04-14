#ifndef SIMFW_RTE_CLUSTER_EXECUTABLE_HPP
#define SIMFW_RTE_CLUSTER_EXECUTABLE_HPP

namespace simfw { namespace rte { namespace cluster {

    class executable : public iexecutable {
    public:
        executable(const char* path){
            handle = dlopen(path, RTLD_NOW);
            if(!handle) throw std::runtime_error("Error: cannot open shared object!");
            dlerror(); // reset errors
            fptr = dlsym(handle, "main");
            if(dlerror()) throw std::runtime_error("Error: cannot load symbol!");
        }
       ~executable() override {
            dlclose(handle);
        }
        void operator()(int argc, char** argv) override {
            typedef int (*fptr_t)(int,char**);
            ((fptr_t)fptr)(argc, argv);
        }
        void operator()() override {
            typedef int (*fptr_t)();
            ((fptr_t)fptr)();
        }
    private:
        void* handle;
        void* fptr;
    };

} } }

#endif
