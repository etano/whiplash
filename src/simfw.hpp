#ifndef SIMFW_HPP
#define SIMFW_HPP
// {{{ system includes
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <limits>
#include <dlfcn.h>
#include <stdexcept>
// }}}

#include "rte/interface.hpp"
#include "odb/interface.hpp"

#include "rte/cluster.hpp"
#include "odb/mongo.hpp"

#include "entities/abstract.hpp"
#include "entities/abstract_dynamic.hpp"
#include "entities/sat.hpp"
#include "entities/tsp.hpp"

#include "entities/detail/hamil.hpp"

#include "deployment/h693.h"
#include "deployment/h693.hpp"

#endif
