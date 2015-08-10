#ifndef WDB_RTE_SIMPLE_SCHEDULER_HPP
#define WDB_RTE_SIMPLE_SCHEDULER_HPP

namespace wdb { namespace rte { namespace simple {

    class scheduler : public ischeduler {
    public:
        template<class DB>
        scheduler(const DB& db, const char* log){
            pid_t pid;
            pid = fork();
            if(pid < 0) exit(EXIT_FAILURE);
            if(pid > 0) exit(EXIT_SUCCESS);
            
            umask(0);
            
            // Connect to syslog
            openlog(log,LOG_NOWAIT|LOG_PID,LOG_USER);
            syslog(LOG_NOTICE, "Successfully started daemon\n");
            
            // Create process group
            pid_t sid;
            sid = setsid();
            if(sid < 0){
                syslog(LOG_ERR, "Could not create process group\n");
                exit(EXIT_FAILURE);
            }
            
            // Change the current working directory
            if((chdir("/")) < 0){
                syslog(LOG_ERR, "Could not change working directory to /\n");
                exit(EXIT_FAILURE);
            }
            
            // Close the standard file descriptors
            close(STDIN_FILENO);
            close(STDOUT_FILENO);
            close(STDERR_FILENO);
            
            // Payload
            while(true){
                // launch a test-worker
                // monitor the data-base state / report
                sleep(1);
            }
        }

        virtual ~scheduler() override {
            closelog();
        }

        virtual void expand(size_t res) override {
            // spawn a new process
        }

        virtual void shrink(size_t res) override {
            // shrink if possible
        }

        virtual void schedule() override {}
    };

} } }

#endif
