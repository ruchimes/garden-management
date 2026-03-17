#!/bin/zsh
# Instalar dependencias sin activar el dev server
cd /Users/o019115/BBVA/HUERTO_APP
unset npm_config_prefix
/Users/o019115/.nvm/versions/node/v24.13.0/bin/npm install pouchdb pouchdb-find @types/pouchdb @types/pouchdb-find --legacy-peer-deps --ignore-scripts
echo "DONE"
