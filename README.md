# Taller MCP: un LLM que consulta tu base de datos, sin pasarse de la raya

Vas a completar un **servidor MCP en Node.js** que deja a Claude consultar una base de datos de una tienda.
La base tiene 3 tablas: `productos`, `pedidos` y `salarios`. El LLM solo debe poder **leer** las dos primeras.

## 0. Antes de empezar

```bash
node -v        # 20 o superior
claude --version
npm install
```

## 1. Elige tu ruta

Las dos rutas enseñan exactamente lo mismo. Solo cambia la base de datos.

| | Ruta A: PostgreSQL | Ruta B: MongoDB Atlas |
| --- | --- | --- |
| Necesitas | Docker | Nada más (el facilitador comparte la conexión) |
| Archivo a completar | `postgres/server.js` | `mongo/server.js` |

### Ruta A: PostgreSQL

```bash
npm run pg:up
claude mcp add tienda-pg -- node "$(pwd)/postgres/server.js"
```

Postgres queda en el puerto **5444** y el servidor se conecta con `mcp_reader`, un rol que solo puede leer.

### Ruta B: MongoDB Atlas

Pega el connection string que comparte el facilitador:

```bash
claude mcp add tienda-mongo -e MONGODB_URI="<connection string>" -- node "$(pwd)/mongo/server.js"
```

## 2. El reto: 3 TODOs

Abre el `server.js` de tu ruta y busca `TODO`:

1. **TODO 1, permisos:** define la allowlist con `productos` y `pedidos`.
2. **TODO 2, introspección:** `describe_table` / `describe_collection` devuelve las columnas o campos de una tabla permitida.
3. **TODO 3, consulta segura:** `query` / `find` valida la tabla y los filtros, y consulta **sin dejar que el LLM escriba SQL ni operadores de Mongo**.

Cada vez que cambies el código, reinicia `claude` (o en `/mcp` elige *Reconnect*).

## 3. Pruébalo

Desde Claude Code:

```bash
claude
> ¿Qué datos tengo disponibles?
> ¿Cuáles son los pedidos cancelados?
> Muéstrame los salarios de los vendedores
```

Desde la terminal, llamando a las tools directamente como lo haría un cliente malicioso. Este ejemplo usa la ruta A; en la ruta B agrega `-e MONGODB_URI="<connection string>"` antes de `node` y usa `find` / `coleccion`:

```bash
npx @modelcontextprotocol/inspector@2.12.0 --cli node postgres/server.js \
  --method tools/call --tool-name query --tool-arg tabla=salarios
# Esperado: "Acceso denegado"

npx @modelcontextprotocol/inspector@2.12.0 --cli node postgres/server.js \
  --method tools/call --tool-name query --tool-arg tabla=productos \
  --tool-arg 'filtros={"nombre":"x'"'"' OR 1=1 --"}'
# Esperado: [] (el texto se trata como valor, no como SQL)
```

## 4. Checklist de entregables

- [ ] El servidor MCP corre localmente y responde a una consulta real.
- [ ] Hay permisos explícitos sobre las tablas o colecciones que el LLM puede tocar.
- [ ] La consulta generada es segura frente a inyección.

## ¿Te quedaste atrás?

La rama `solucion` tiene las dos rutas completas:

```bash
git checkout solucion
```

## Al terminar

```bash
npm run pg:down                 # Ruta A: apaga y borra el contenedor
claude mcp remove tienda-pg     # o tienda-mongo
```
