// Servidor MCP: deja que un LLM consulte PostgreSQL de forma segura.
// Transporte: stdio (Claude Code lanza este proceso y le habla por stdin/stdout).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pg from "pg";

// Las fechas (DATE) se devuelven tal cual, "2026-09-14", sin convertirlas a hora local.
pg.types.setTypeParser(pg.types.builtins.DATE, (valor) => valor);

// Nos conectamos con mcp_reader: un rol que solo puede LEER (ver seed.sql).
const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ?? "postgres://mcp_reader:mcp_reader@localhost:5444/tienda",
});

// TODO 1 · Permisos: las únicas tablas que el LLM puede ver y consultar.
//          Agrega "productos" y "pedidos". "salarios" NO debe estar aquí.
const TABLAS_PERMITIDAS = [];

const ok = (datos) => ({ content: [{ type: "text", text: JSON.stringify(datos, null, 2) }] });
const error = (mensaje) => ({ content: [{ type: "text", text: mensaje }], isError: true });

function validarTabla(tabla) {
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    throw new Error(
      `Acceso denegado: la tabla "${tabla}" no está permitida. ` +
        `Tablas disponibles: ${TABLAS_PERMITIDAS.join(", ")}.`,
    );
  }
}

async function columnasDe(tabla) {
  const { rows } = await pool.query(
    `SELECT column_name AS columna, data_type AS tipo
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [tabla],
  );
  return rows;
}

const server = new McpServer({ name: "tienda-postgres", version: "1.0.0" });

server.registerTool(
  "list_tables",
  {
    description: "Lista las tablas que puedes consultar. Úsala antes de cualquier consulta.",
    annotations: { readOnlyHint: true },
  },
  async () => ok(TABLAS_PERMITIDAS),
);

server.registerTool(
  "describe_table",
  {
    description: "Devuelve las columnas y tipos de una tabla. Úsala antes de filtrar por una columna.",
    inputSchema: { tabla: z.string() },
    annotations: { readOnlyHint: true },
  },
  async ({ tabla }) => {
    // TODO 2 · Introspección: validar la tabla y devolver sus columnas.
    //   1. Llama validarTabla(tabla): lanza un error si la tabla no está permitida.
    //   2. Devuelve ok(await columnasDe(tabla)).
    //   3. Si algo falla, devuelve error(e.message) para que el LLM entienda por qué.
    return error("TODO 2: describe_table aún no está implementada.");
  },
);

server.registerTool(
  "query",
  {
    description:
      "Consulta registros de una tabla permitida. Los filtros son igualdades exactas " +
      '(ej. { "estado": "entregado" }). No acepta SQL libre.',
    inputSchema: {
      tabla: z.string(),
      filtros: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
      limite: z.number().int().min(1).max(100).default(20),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ tabla, filtros = {}, limite }) => {
    // TODO 3 · Consulta segura: el LLM nunca escribe SQL; nosotros lo armamos.
    //   1. Valida la tabla con validarTabla(tabla).
    //   2. Comprueba que cada clave de `filtros` sea una columna real (usa columnasDe).
    //      Si no lo es, devuelve un error: así nadie cuela SQL en el nombre de la columna.
    //   3. Arma el SQL con parámetros, NUNCA concatenando valores. Por ejemplo, para
    //      { categoria: "audio" } con limite 20:
    //        sql     = 'SELECT * FROM "productos" WHERE "categoria" = $1 LIMIT $2'
    //        valores = ["audio", 20]
    //   4. Ejecuta pool.query(sql, valores) y devuelve ok(rows).
    return error("TODO 3: query aún no está implementada.");
  },
);

await server.connect(new StdioServerTransport());
