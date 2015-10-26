#ifndef WDB_RTE_COMMON_APP_HPP
#define WDB_RTE_COMMON_APP_HPP

namespace wdb { namespace rte {

    class app : public iapp {
    public:
        app(std::string path){
            open(path);
        }
        virtual ~app() override {
            dlclose(handle);
        }
        virtual void operator()(int argc, char** argv) override {
            using fptr_t = int(*)(int,char**);
            ((fptr_t)fptr)(argc, argv);
        }
        virtual bool preload(int argc, char** argv) override {
            if(!fptr_preload) return false;
            using fptr_t = void (*)(int,char**);
            ((fptr_t)fptr_preload)(argc, argv);
            return true;
        }
        virtual void operator()() override {
            using fptr_t = int (*)();
            ((fptr_t)fptr)();
        }
        void open(std::string path){
            handle = dlopen(path.c_str(), RTLD_NOW);
            if(!handle) throw std::runtime_error("Error: cannot open shared object!");
            dlerror(); // reset errors
            fptr = dlsym(handle, "main");
            if(dlerror()) throw std::runtime_error("Error: cannot load symbol!");
            fptr_preload = dlsym(handle, "wdb_preload");
            if(dlerror()) fptr_preload = NULL;
        }
    private:
        void* handle;
        void* fptr_preload;
        void* fptr;
    };

} }

#endif
