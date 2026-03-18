# CouchDB con CORS habilitado para HuertoApp
FROM couchdb:3.4

# ⚠️  NO pongas credenciales aquí.
# Configura COUCHDB_USER y COUCHDB_PASSWORD como variables
# de entorno en el panel de Render (Settings → Environment).
ENV COUCHDB_USER=""
ENV COUCHDB_PASSWORD=""

# Copiar configuración con CORS habilitado
COPY couchdb/couchdb.ini /opt/couchdb/etc/local.d/huerto.ini

EXPOSE 5984
