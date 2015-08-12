#ifndef WDB_UTILS_SYSLOG_HPP
#define WDB_UTILS_SYSLOG_HPP

namespace wdb {

    class syslog {
    public:
        syslog(){
            openlog("whiplash",LOG_NOWAIT|LOG_PID,LOG_USER);
        }
       ~syslog(){
            closelog();
        }
        void notice(const char* m){
            ::syslog(LOG_NOTICE, m);
        }
        void error(const char* m){
            ::syslog(LOG_ERR, m); exit(EXIT_FAILURE);
        }
    };

}

#endif
