#! /bin/bash

BUILDPATH=`pwd`

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
    git submodule update --init --recursive

    cd depends/mongo-c-driver
    ./autogen.sh --prefix=${BUILDPATH}
    make -j${NTHREADS} && make install
    cd ../../

    cd depends/mongo-cxx-driver/build
    export PKG_CONFIG_PATH=${PKG_CONFIG_PATH}:${BUILDPATH}/lib/pkgconfig
    cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=${BUILDPATH} ..
    make -j${NTHREADS} && make install
    cd ../../../

    cd src
    make -j${NTHREADS}
    cd ../
fi

