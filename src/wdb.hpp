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
// }}}

#include "rte/interface.hpp"
#include "odb/interface.hpp"

#include "rte/cluster.hpp"
#include "odb/mongo.hpp"

#include "entities/generic.hpp"
#include "entities/dynamic_generic.hpp"

#include "entities/sat/sat.hpp"
#include "entities/tsp/tsp.hpp"
#include "entities/ising.hpp"
#include "entities/qubo/qubo.hpp"

#include "deployment/basic.h"
#include "deployment/basic.hpp"

#endif
