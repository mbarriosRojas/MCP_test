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
const TABLAS_PERMITIDAS = ["productos", "pedidos"];

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
    try {
      validarTabla(tabla);
      return ok(await columnasDe(tabla));
    } catch (e) {
      return error(e.message);
    }
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
    try {
      validarTabla(tabla);

      // Solo se puede filtrar por columnas que existen de verdad.
      const columnas = (await columnasDe(tabla)).map((c) => c.columna);
      for (const columna of Object.keys(filtros)) {
        if (!columnas.includes(columna)) {
          return error(`La columna "${columna}" no existe en "${tabla}". Columnas: ${columnas.join(", ")}.`);
        }
      }

      // Los valores van como parámetros ($1, $2...), nunca concatenados: así no hay inyección SQL.
      const valores = Object.values(filtros);
      const where = Object.keys(filtros).map((columna, i) => `"${columna}" = $${i + 1}`);
      const sql =
        `SELECT * FROM "${tabla}"` +
        (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
        ` LIMIT $${valores.length + 1}`;

      const { rows } = await pool.query(sql, [...valores, limite]);
      return ok(rows);
    } catch (e) {
      return error(e.message);
    }
  },
);

await server.connect(new StdioServerTransport());
