#ifndef WDB_HPP
#define WDB_HPP
// {{{ system includes
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <limits>
#include <dlfcn.h>
#include <stdexcept>
#include <memory>
#include <ctime>
#include <vector>
#include <random>
#include <sys/time.h>
#include <time.h>
#include <unordered_map>
#include <tuple>
#include <unistd.h>
#include <sys/stat.h>
#include <syslog.h>
#include <signal.h>
#include <algorithm>
#include <thread>
// }}}

#include "utils/timer.hpp"
#include "utils/optional.hpp"
#include "utils/parameters.hpp"
#include "utils/syslog.hpp"

#include "odb/interface.hpp"
#include "rte/interface.hpp"
#include "odb/mongo.hpp"
#include "rte/simple.hpp"
#include "rte/slurm.hpp"

#include "entities/factory.h"
#include "entities/generic.hpp"
#include "entities/ising.hpp"
#include "entities/xx.hpp"
#include "entities/sat.hpp"
#include "entities/tsp.hpp"
#include "entities/factory.hpp"

#include "deployment/basic.h"
#include "deployment/basic.hpp"
#include "deployment/node.h"
#include "deployment/node.hpp"

#include "utils/find.hpp"

using framework = wdb::deployment::node;
//#define DBHOST "cwave.ethz.ch:27017"
#define DBHOST "whiplash-dev.ethz.ch:27017"

#endif
