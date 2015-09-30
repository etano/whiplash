cmake_minimum_required(VERSION 2.8)
project(unitary_evolution_wrapspin_glass_solver)

#--------------------------------------------------
# Setup Output directories
#--------------------------------------------------
SET (CMAKE_RUNTIME_OUTPUT_DIRECTORY
    ${PROJECT_BINARY_DIR}/bin CACHE PATH "Single Directory for all Executables."
)
SET (CMAKE_LIBRARY_OUTPUT_DIRECTORY
    ${PROJECT_BINARY_DIR}/bin CACHE PATH "Single Directory for all Libraries"
)
SET (CMAKE_ARCHIVE_OUTPUT_DIRECTORY
    ${PROJECT_BINARY_DIR}/bin CACHE PATH "Single Directory for all static libraries."
)

#--------------------------------------------------
# Flags
#--------------------------------------------------
# needed for all compilers
set(CMAKE_CXX_FLAGS "-std=c++11")

if ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "Clang")
  set(CMAKE_BUILD_TYPE RELEASE)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Wall -pedantic -mavx")
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "GNU")
  set(CMAKE_BUILD_TYPE RELEASE)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Wall -pedantic -fopenmp -mavx")
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "Intel")
elseif ("${CMAKE_CXX_COMPILER_ID}" STREQUAL "MSVC")
endif()

#--------------------------------------------------
# MongoDB (really required here?)
#--------------------------------------------------
include(FindPkgConfig)
pkg_check_modules(MONGOCXX REQUIRED libmongocxx)
include_directories(${MONGOCXX_INCLUDE_DIRS})
link_directories(${MONGOCXX_LIBRARY_DIRS})

#--------------------------------------------------
# WhiplashDB
#--------------------------------------------------
include_directories($ENV{WDB_HOME}/src) # @todo(slava) replace by PROJECT_SOURCE_DIR
link_libraries(dl)

if(BUILD_STATIC)
    set(WDB_FLAGS "-w -Wfatal-errors")
    set(suffix "static")
else()
    set(WDB_FLAGS "-w -Wfatal-errors -fPIC -shared")
    set(suffix "shared")
endif()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${WDB_FLAGS}")

#--------------------------------------------------
# Exe
#--------------------------------------------------
include_directories(../unitary_evolution/src)
add_executable(ue_solver.${suffix} ue_solver.cpp)
target_link_libraries(ue_solver.${suffix} ${MONGOCXX_LIBRARIES})

#--------------------------------------------------
# Install
#--------------------------------------------------
install(TARGETS ue_solver.${suffix}
        RUNTIME DESTINATION bin
        ARCHIVE DESTINATION lib
        LIBRARY DESTINATION lib
        )
SET(CMAKE_INSTALL_PREFIX ${CMAKE_HOME_DIRECTORY})

