#ifndef WDB_UTILS_SYSLOG_HPP
#define WDB_UTILS_SYSLOG_HPP

#define WDB_SYSLOG_VERBOSE

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
            #ifdef WDB_SYSLOG_VERBOSE
            printf("Notice: %s\n", m);
            #endif
            ::syslog(LOG_NOTICE, m);
        }
        void error(const char* m){
            #ifdef WDB_SYSLOG_VERBOSE
            printf("Error: %s\n", m);
            #endif
            ::syslog(LOG_ERR, m); exit(EXIT_FAILURE);
        }
    };

}

#endif
