// Servidor MCP: deja que un LLM consulte MongoDB de forma segura.
// Transporte: stdio (Claude Code lanza este proceso y le habla por stdin/stdout).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MongoClient } from "mongodb";

// El connection string compartido usa un usuario de Atlas con rol "read": solo puede LEER.
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Falta MONGODB_URI. Pásalo al registrar el servidor (ver README).");
  process.exit(1);
}
const db = new MongoClient(uri).db("taller");

// TODO 1 · Permisos: las únicas colecciones que el LLM puede ver y consultar.
//          Agrega "productos" y "pedidos". "salarios" NO debe estar aquí.
const COLECCIONES_PERMITIDAS = [];

const ok = (datos) => ({ content: [{ type: "text", text: JSON.stringify(datos, null, 2) }] });
const error = (mensaje) => ({ content: [{ type: "text", text: mensaje }], isError: true });

function validarColeccion(coleccion) {
  if (!COLECCIONES_PERMITIDAS.includes(coleccion)) {
    throw new Error(
      `Acceso denegado: la colección "${coleccion}" no está permitida. ` +
        `Colecciones disponibles: ${COLECCIONES_PERMITIDAS.join(", ")}.`,
    );
  }
}

// Mongo no tiene esquema fijo: lo deducimos de un documento de ejemplo.
async function camposDe(coleccion) {
  const ejemplo = await db.collection(coleccion).findOne({}, { projection: { _id: 0 } });
  return Object.entries(ejemplo ?? {}).map(([campo, valor]) => ({ campo, tipo: typeof valor }));
}

const server = new McpServer({ name: "tienda-mongo", version: "1.0.0" });

server.registerTool(
  "list_collections",
  {
    description: "Lista las colecciones que puedes consultar. Úsala antes de cualquier consulta.",
    annotations: { readOnlyHint: true },
  },
  async () => ok(COLECCIONES_PERMITIDAS),
);

server.registerTool(
  "describe_collection",
  {
    description: "Devuelve los campos y tipos de una colección. Úsala antes de filtrar por un campo.",
    inputSchema: { coleccion: z.string() },
    annotations: { readOnlyHint: true },
  },
  async ({ coleccion }) => {
    // TODO 2 · Introspección: validar la colección y devolver sus campos.
    //   1. Llama validarColeccion(coleccion): lanza un error si no está permitida.
    //   2. Devuelve ok(await camposDe(coleccion)).
    //   3. Si algo falla, devuelve error(e.message) para que el LLM entienda por qué.
    return error("TODO 2: describe_collection aún no está implementada.");
  },
);

server.registerTool(
  "find",
  {
    description:
      "Consulta documentos de una colección permitida. Los filtros son igualdades exactas " +
      '(ej. { "estado": "entregado" }). No acepta operadores de Mongo.',
    inputSchema: {
      coleccion: z.string(),
      filtros: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
      limite: z.number().int().min(1).max(100).default(20),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ coleccion, filtros = {}, limite }) => {
    // TODO 3 · Consulta segura: nada de operadores ($where, $ne, $gt...) que cambien el sentido del filtro.
    //   1. Valida la colección con validarColeccion(coleccion).
    //   2. Rechaza cualquier campo de `filtros` que empiece por "$" (ej. { "$where": "..." }).
    //      Los valores ya llegan como texto, número o booleano: el inputSchema bloquea { "$ne": null }.
    //   3. Ejecuta db.collection(coleccion).find(filtros, { projection: { _id: 0 } })
    //      .limit(limite).toArray() y devuelve ok(documentos).
    return error("TODO 3: find aún no está implementada.");
  },
);

await server.connect(new StdioServerTransport());
