#include <stdlib.h>
#include <unistd.h>
#include <sys/stat.h>
#include <syslog.h>
#include "wdb.hpp"
using wdb::odb::mongo::objectdb;

int main(int argc, char* argv[]){
    // Spawn child
    pid_t pid;
    pid = fork();
    if (pid < 0) exit(EXIT_FAILURE);
    if (pid > 0) exit(EXIT_SUCCESS);

    // Set umask
    umask(0);

    // Connect to syslog
    openlog(argv[0],LOG_NOWAIT|LOG_PID,LOG_USER);
    syslog(LOG_NOTICE, "Successfully started daemon\n");

    // Create process group
    pid_t sid;
    sid = setsid();
    if (sid < 0) {
        syslog(LOG_ERR, "Could not create process group\n");
        exit(EXIT_FAILURE);
    }

    // Change the current working directory
    if ((chdir("/")) < 0) {
        syslog(LOG_ERR, "Could not change working directory to /\n");
        exit(EXIT_FAILURE);
    }

    // Close the standard file descriptors
    close(STDIN_FILENO);
    close(STDOUT_FILENO);
    close(STDERR_FILENO);

    // Payload
    while(true) {
        sleep(1);
        // Check for unresolved properties and resolve them
        objectdb db("cwave.ethz.ch:27017");
        wdb::deployment::basic sf(db);
        std::vector<wdb::entities::generic::property> ps(sf.fetch_unresolved_properties());
        for (auto &p : ps) p.resolve();
    }

    // Close log
    closelog();
}
