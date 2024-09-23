#!/bin/sh

npm install -g npm@10.5.2
npm cache verify
npm cache clean --force
npm install is-fullwidth-code-point@3.0.0

# Install dependencies listed in package.json
npm install