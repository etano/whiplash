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
// }}}

#include "rte/interface.hpp"
#include "odb/interface.hpp"

#include "rte/cluster.hpp"
#include "odb/mongo.hpp"

#include "entities/generic/hamil.hpp"
#include "entities/generic/property.hpp"
#include "entities/generic/abstract.hpp"
#include "entities/generic/abstract_dynamic.hpp"

#include "entities/sat/sat.hpp"
#include "entities/tsp/tsp.hpp"
#include "entities/ising/ising.hpp"
#include "entities/qubo/qubo.hpp"

#include "deployment/basic.h"
#include "deployment/basic.hpp"

#endif
