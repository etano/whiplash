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
#include <unordered_map>
// }}}

#include "odb/interface.hpp"
#include "rte/interface.hpp"
#include "odb/mongo.hpp"
#include "rte/cluster.hpp"

#include "entities/generic.hpp"
#include "entities/ising.hpp"
#include "entities/qubo.hpp"
#include "entities/sat.hpp"
#include "entities/tsp.hpp"
#include "entities/factory.hpp"

#include "deployment/basic.h"
#include "deployment/basic.hpp"

#endif
