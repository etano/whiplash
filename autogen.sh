#! /bin/bash

# Get parameters
ORIGPATH=`pwd`
BUILDPATH=${ORIGPATH}
NTHREADS=1
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
    # Get the submodules
    git submodule update --init --recursive

    # Linking hack to get libbson to work
    if [ ! -f ${ORIGPATH}/depends/mongo-c-driver/src/libbson/README ]; then
        ln -s ${ORIGPATH}/depends/mongo-c-driver/src/libbson/README.md ${ORIGPATH}/depends/mongo-c-driver/src/libbson/README
    fi

    # Compile and install mongo-c-driver and libbson
    cd depends/mongo-c-driver
    ./autogen.sh --prefix=${BUILDPATH}
    make -j${NTHREADS} && make install
    cd ../../

    # Compile and install mongo-cxx-driver
    cd depends/mongo-cxx-driver/build
    export PKG_CONFIG_PATH=${PKG_CONFIG_PATH}:${BUILDPATH}/lib/pkgconfig
    cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=${BUILDPATH} ..
    make -j${NTHREADS} && make install
    cd ../../../

    # Compile whiplashdb
    cd src
    make -j${NTHREADS}
    cd ../
fi

