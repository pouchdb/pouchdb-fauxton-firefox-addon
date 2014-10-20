#!/bin/sh

#cleanup
rm -rf data/generated
rm -rf lib/external

#setup
mkdir data/generated
mkdir lib/external

#build
cd ../pouchdb-fauxton-logic
npm run build-firefox

#copy
cp -r fauxton/ ../pouchdb-fauxton-firefox-addon/data/generated/fauxton
cp dist/injected.js ../pouchdb-fauxton-firefox-addon/data/generated/eval.js
cp lib/postmessagerpc.js ../pouchdb-fauxton-firefox-addon/lib/external
