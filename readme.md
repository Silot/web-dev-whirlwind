# web dev whirlwind

* diy modular frontend
* streams
* webrtc + websockets
* indexeddb/leveldb
* p2p
* crypto
* testing
* webgl + webaudio

---
# follow along

ESSID: CITY-SOF

PASSWORD: sofouaccess09

```
git clone https://github.com/substack/thess-web-workshop.git
cd thess-web-workshop
npm i && npm i -g budo bankai browserify watchify \
  uglify-js wsnc baudio
```

---
# npm config

to install command-line packages with npm without `sudo`:

```
mkdir -p $HOME/prefix/{bin,lib,man} && npm config set prefix $HOME/prefix \
&& echo -e '\nexport PATH=$HOME/prefix/bin:'$PATH >> ~/.profile
```

