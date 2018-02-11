#!/bin/sh

BUILD_DIR=`pwd`/build

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR/package
cp -r src/* $BUILD_DIR/package

./ipkg-build -c $BUILD_DIR/package $BUILD_DIR
