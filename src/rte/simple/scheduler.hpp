#ifndef WDB_RTE_SIMPLE_SCHEDULER_HPP
#define WDB_RTE_SIMPLE_SCHEDULER_HPP

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
            // launch a test-worker
            // monitor the data-base state / report
            while(true){
                sleep(1);
            }
        }

        virtual ~scheduler() override {
            delete logger;
        }

        virtual void expand(size_t res) override {
            // spawn a new process
        }

        virtual void shrink(size_t res) override {
            // shrink if possible
        }

        virtual void schedule() override {}

        pid_t pid;
        pid_t sid;
        logger_type* logger;
    };

} } }

#endif
