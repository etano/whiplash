#ifndef WDB_RTE_SLURM_EXECUTABLE_HPP
#define WDB_RTE_SLURM_EXECUTABLE_HPP

namespace wdb { namespace rte { namespace slurm {

    class executable : public iexecutable {
    public:
        executable(std::string path){
            open(path);
        }
        virtual ~executable() override {
            dlclose(handle);
        }
        virtual void operator()(int argc, char** argv) override {
            typedef int (*fptr_t)(int,char**);
            ((fptr_t)fptr)(argc, argv);
        }
        virtual void operator()() override {
            typedef int (*fptr_t)();
            ((fptr_t)fptr)();
        }
        void open(std::string path){
            handle = dlopen(path.c_str(), RTLD_NOW);
            if(!handle) throw std::runtime_error("Error: cannot open shared object!");
            dlerror(); // reset errors
            fptr = dlsym(handle, "main");
            if(dlerror()) throw std::runtime_error("Error: cannot load symbol!");
        }
    private:
        void* handle;
        void* fptr;
    };

} } }

#endif
