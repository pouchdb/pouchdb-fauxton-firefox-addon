pouchdb-fauxton-firefox-addon
=============================

A Firefox (jetpack) add-on that allows you to inspect all PouchDB
databases on the current web page. It only works in Firefox 34 or later.


![pouchdb-fauxton-firefox-addon in action](http://s10.postimg.org/7lyf3r8p5/firefox_pouchdb_fauxton.png)
![pouchdb-fauxton-firefox-addon error example](http://s1.postimg.org/u5nf6djhr/firefox_nopouchdb.png)

Internals
---------

Make sure you're familiar with how
[pouchdb-fauxton-logic](https://github.com/marten-de-vries/pouchdb-fauxton-logic)
works before reading this.

This add-on shows a special version of PouchDB-Fauxton inside a
developer tool panel in Firefox. This version doesn't directly run
pouchdb-route on the resultive CouchDB request object, but instead uses
message passing to pass it to the add-on. The add-on passes it to the
current page in the current tab, which *does* run pouchdb-route on it,
and then the whole thing happens again in reverse. This way, it
gets to see the PouchDB databases of the current page, not of the
developer tools.

The add-on also provides a way to get all the IndexedDB databases in the
current page, because Firefox doesn't support that natively while it
*is* the most reliable way to implement `PouchDB.allDbs()`.

Building
--------

Get a copy of [pouchdb-fauxton-logic](https://github.com/marten-de-vries/pouchdb-fauxton-logic)
and make sure it's accessable under `../pouchdb-fauxton-logic`. Also
make sure `npm install` has been ran at least once it that directory.
Then run:

	./build-generated-files.sh

To run/build the extension, I personally use another small script, but
it's not included because it hard codes quite a few paths:

	#!/bin/sh
	cd ~/Programs/addon-sdk-1.17/
	source bin/activate
	cd ~/git/pouchdb-fauxton-firefox-addon
	cfx run -b /usr/bin/firefox-trunk #or: cfx xpi
