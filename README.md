# Pixelwave: A Pixelflut client

## Put the nix flake on it
```bash
# enter dev shell
nix develop

# install packages
npm ci

# run
pixelflut
```

---

Pixelwave is a node.js based Pixelflut client that makes use of the cluster module to enhance the performance for multicore environments. Supports .png with transparency and .jpeg/jpg images.

# Installation

* `git clone https://github.com/Vaalyn/Pixelwave.git`
* `npm install`

# Using the client

`node index.js --image=<path> --host=<ip> --port=<port>`

# Additional arguments

* `--offsetX=<px>`
* `--offsetY=<px>`
* `--threads=<number>`
