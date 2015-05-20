#! /bin/sh

ORIGDIR=`pwd`
echo "Building to ${ORIGDIR}"

if [ -d .git ]; then
    git submodule init
    git submodule update

    cd depends/mongo-c-driver
    ./autogen.sh --prefix=${ORIGDIR}
    make && make install
    cd ../../

    cd depends/mongo-cxx-driver/build
    cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=${ORIGDIR} ..
    make && make install
    cd ../../../

    cd src
    make && make install
    cd ../
fi

