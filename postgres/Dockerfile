FROM postgres:16-alpine
# El seed va dentro de la imagen: así no depende de carpetas compartidas con Docker.
COPY seed.sql /docker-entrypoint-initdb.d/seed.sql
