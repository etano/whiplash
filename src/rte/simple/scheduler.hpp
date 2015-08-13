#ifndef WDB_RTE_SIMPLE_SCHEDULER_HPP
#define WDB_RTE_SIMPLE_SCHEDULER_HPP

#define WORKER_BINARY "worker.driver"

namespace wdb { namespace rte { namespace simple {

    class scheduler : public ischeduler {
    public:
        typedef wdb::syslog logger_type;

        template<class DB>
        scheduler(const DB& db){
            pid = fork();
            if(pid < 0) exit(EXIT_FAILURE);
            if(pid > 0) exit(EXIT_SUCCESS);
            umask(0);
            
            logger = new logger_type();

            if((sid = setsid()) < 0) logger->error("Could not create process group\n");
            if((chdir("/")) < 0) logger->error("Could not change working directory to /\n");
            close(STDIN_FILENO); close(STDOUT_FILENO); close(STDERR_FILENO);

            logger->notice("Successfully started daemon\n");
        }

        void yield(){
            while(true){
                sleep(1);
            }
        }

        virtual ~scheduler() override {
            delete logger;
        }

        virtual void expand() override {
            pid = fork();
            if(pid < 0) logger->error("Could not create a process");
            if(pid > 0) return;
            if(execvp(WORKER_BINARY, NULL) < 0) exit(EXIT_FAILURE);
            // ... not reachable
        }

        virtual void shrink() override {
            kill(pid, SIGKILL);
        }

        virtual void schedule() override {}

        pid_t pid;
        pid_t sid;
        logger_type* logger;
    };

} } }

#undef WORKER_BINARY
#endif
