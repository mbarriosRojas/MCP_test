-- Datos de ejemplo: una tienda.
-- productos y pedidos son las tablas que el LLM puede consultar.
-- salarios existe, pero el LLM NO debe poder leerla.

CREATE TABLE productos (
  id        SERIAL PRIMARY KEY,
  nombre    TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio    NUMERIC(10, 2) NOT NULL,
  stock     INTEGER NOT NULL
);

CREATE TABLE pedidos (
  id          SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cliente     TEXT NOT NULL,
  vendedor    TEXT NOT NULL,
  cantidad    INTEGER NOT NULL,
  estado      TEXT NOT NULL,
  fecha       DATE NOT NULL
);

CREATE TABLE salarios (
  vendedor        TEXT PRIMARY KEY,
  salario_mensual NUMERIC(10, 2) NOT NULL,
  cuenta_bancaria TEXT NOT NULL
);

INSERT INTO productos (nombre, categoria, precio, stock) VALUES
  ('Laptop Pro 14',        'computadores', 1899.00, 12),
  ('Monitor 27" 4K',       'monitores',     429.90, 30),
  ('Teclado mecánico',     'accesorios',     89.50, 75),
  ('Mouse inalámbrico',    'accesorios',     34.99, 120),
  ('Audífonos ANC',        'audio',         249.00, 40),
  ('Webcam Full HD',       'accesorios',     59.00, 55),
  ('Silla ergonómica',     'mobiliario',    349.00, 18),
  ('Escritorio elevable',  'mobiliario',    529.00, 9),
  ('Disco SSD 1TB',        'almacenamiento', 99.90, 64),
  ('Tablet 11"',           'computadores',  599.00, 22);

INSERT INTO pedidos (producto_id, cliente, vendedor, cantidad, estado, fecha) VALUES
  (1,  'Andrea Gómez',    'Laura',  1, 'entregado', '2026-09-02'),
  (3,  'Carlos Ruiz',     'Pedro',  2, 'entregado', '2026-09-05'),
  (2,  'Diana López',     'Laura',  2, 'enviado',   '2026-09-11'),
  (5,  'Esteban Mora',    'Sofía',  1, 'cancelado', '2026-09-14'),
  (4,  'Felipe Torres',   'Pedro',  3, 'entregado', '2026-09-18'),
  (7,  'Gabriela Ríos',   'Laura',  1, 'enviado',   '2026-09-23'),
  (9,  'Héctor Salas',    'Sofía',  4, 'entregado', '2026-09-29'),
  (10, 'Isabel Vargas',   'Laura',  1, 'pendiente', '2026-10-03'),
  (6,  'Juan Pérez',      'Pedro',  2, 'cancelado', '2026-10-08'),
  (8,  'Karen Castro',    'Sofía',  1, 'pendiente', '2026-10-12');

INSERT INTO salarios (vendedor, salario_mensual, cuenta_bancaria) VALUES
  ('Laura', 4200.00, '0011-2233-4455'),
  ('Pedro', 3800.00, '0099-8877-6655'),
  ('Sofía', 4000.00, '0055-6677-8899');

-- Capa de base de datos: el servidor MCP se conecta con este rol,
-- que solo puede LEER productos y pedidos. Aunque el código fallara,
-- Postgres seguiría negando salarios y cualquier escritura.
CREATE ROLE mcp_reader LOGIN PASSWORD 'mcp_reader';
GRANT CONNECT ON DATABASE tienda TO mcp_reader;
GRANT USAGE ON SCHEMA public TO mcp_reader;
GRANT SELECT ON productos, pedidos TO mcp_reader;
