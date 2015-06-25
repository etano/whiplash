#! /bin/bash

# Get parameters
ORIGPATH=`pwd`
BUILDPATH=${ORIGPATH}
NTHREADS=""
for i in "$@"
do
case $i in
    -p=*|--prefix=*)
    BUILDPATH="${i#*=}"
    shift
    ;;
    -j=*|--nthreads=*)
    NTHREADS="${i#*=}"
    shift
    ;;
    *)
            # unknown option
    ;;
esac
done
echo "Building to ${BUILDPATH}"

if [ -d .git ]; then
    # Export PKG_CONFIG_PATH and LD_LIBRARY_PATH
    export PKG_CONFIG_PATH=${PKG_CONFIG_PATH}:${BUILDPATH}/lib/pkgconfig
    export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${BUILDPATH}/lib

    # Get the submodules
    git submodule update --init --recursive

    # Linking hack to get libbson to work
    if [ ! -f ${ORIGPATH}/depends/mongo-c-driver/src/libbson/README ]; then
        ln -s ${ORIGPATH}/depends/mongo-c-driver/src/libbson/README.md ${ORIGPATH}/depends/mongo-c-driver/src/libbson/README
    fi

    # Compile and install mongo-c-driver and libbson
    if [ ! -f ${BUILDPATH}/lib/pkgconfig/libmongoc-1.0.pc ] || [ ! -f ${BUILDPATH}/lib/pkgconfig/libbson-1.0.pc ]; then
        cd depends/mongo-c-driver
        ./autogen.sh --prefix=${BUILDPATH}
        make -j${NTHREADS} && make install
        cd ../../
    fi

    # Compile and install mongo-cxx-driver
    if [ ! -f ${BUILDPATH}/lib/pkgconfig/libmongocxx.pc ] || [ ! -f ${BUILDPATH}/lib/pkgconfig/libbsoncxx.pc ]; then
        cd depends/mongo-cxx-driver/build
        cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=${BUILDPATH} ..
        make -j${NTHREADS} && make install
        cd ../../../
    fi

    # Compile whiplashdb
    cd src
    make -j${NTHREADS} && make install prefix=${BUILDPATH}
    cd ../
fi

