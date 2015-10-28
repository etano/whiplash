#ifndef WDB_RTE_SIMPLE_SCHEDULER_HPP
#define WDB_RTE_SIMPLE_SCHEDULER_HPP

namespace wdb { namespace rte { namespace simple {

    class scheduler : public ischeduler {
    public:
        typedef wdb::syslog logger_type;

        scheduler(ipool& p) : pool(p) {
            #ifdef WDB_NO_DOCKER
            pid = fork();
            if(pid < 0) exit(EXIT_FAILURE);
            if(pid > 0) exit(EXIT_SUCCESS);
            umask(0);
            if((sid = setsid()) < 0) logger->error("Could not create process group\n");
            #endif

            logger = new logger_type();
            logger->notice("Successfully started daemon\n");
        }

        void yield(){
            for(;;){
                if(pool.size()){
                    if(children.size() < get_max_cores()) this->expand();
                }else{
                    if(children.size()) this->shrink();
                }
                sleep(1);
            }
        }

        virtual ~scheduler() override {
            delete logger;
        }

        unsigned get_max_cores() {
            return 1;//std::thread::hardware_concurrency(); // FIXME: Should be specified somehow better
        }

        virtual void expand() override {
            pid = fork();
            if(pid < 0) logger->error("Could not create a process");
            if(pid > 0){
                logger->notice("Expanded the number of workers");
                children.push_back(pid);
                return;
            }
            char *const params[] = {"./bin/worker.driver","-dbhost",const_cast<char*>(pool.get_host().c_str()),NULL};
            if(execvp("./bin/worker.driver", params) < 0) exit(EXIT_FAILURE); // FIXME: Crashes scheduler when single job crashes, maybe fixed
            throw std::runtime_error("execvp error"); // unreachable
        }

        virtual void shrink() override {
            if(children.size()){
                kill(children.back(), SIGKILL); // FIXME: How do we know this child is ok to die?
                children.pop_back();
                logger->notice("Shrank the number of workers");
            }
        }

        virtual void schedule() override {}

        pid_t pid;
        pid_t sid;
        logger_type* logger;
        std::vector<pid_t> children;
        ipool& pool;
    };

} } }

#undef WORKER_BINARY
#endif