# CouchDB con CORS habilitado para HuertoApp
FROM couchdb:3.4

# Variables de entorno con defaults (se sobreescriben en Render)
ENV COUCHDB_USER=admin
ENV COUCHDB_PASSWORD=changeme

# Copiar configuración con CORS habilitado
COPY couchdb.ini /opt/couchdb/etc/local.d/huerto.ini

EXPOSE 5984
