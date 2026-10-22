-- Datos de ejemplo: una clínica. Todos los datos son ficticios.
-- pacientes, doctores y examenes son las tablas que el LLM puede consultar.
-- resultados existe (diagnósticos y notas médicas), pero el LLM NO debe poder leerla.

CREATE TABLE pacientes (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  edad   INTEGER NOT NULL,
  eps    TEXT NOT NULL,
  ciudad TEXT NOT NULL
);

CREATE TABLE doctores (
  id           SERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  consultorio  TEXT NOT NULL
);

CREATE TABLE examenes (
  id          SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  doctor_id   INTEGER NOT NULL REFERENCES doctores(id),
  tipo        TEXT NOT NULL,
  fecha       DATE NOT NULL,
  estado      TEXT NOT NULL
);

CREATE TABLE resultados (
  examen_id     INTEGER PRIMARY KEY REFERENCES examenes(id),
  diagnostico   TEXT NOT NULL,
  valores       TEXT NOT NULL,
  notas_medicas TEXT NOT NULL
);

INSERT INTO pacientes (nombre, edad, eps, ciudad) VALUES
  ('Ana Gómez',       34, 'Sura',      'Medellín'),
  ('Carlos Ruiz',     58, 'Sanitas',   'Bogotá'),
  ('Diana López',     45, 'Nueva EPS', 'Cali'),
  ('Esteban Mora',    67, 'Sura',      'Medellín'),
  ('Felipe Torres',   29, 'Compensar', 'Bogotá'),
  ('Gabriela Castro', 52, 'Sanitas',   'Barranquilla'),
  ('Héctor Salas',    71, 'Nueva EPS', 'Cali'),
  ('Isabel Vargas',   38, 'Compensar', 'Bogotá'),
  ('Juan Pérez',      61, 'Sura',      'Medellín'),
  ('Karen Ospina',    25, 'Sanitas',   'Bogotá');

INSERT INTO doctores (nombre, especialidad, consultorio) VALUES
  ('Laura Ríos',     'Medicina interna',  '101'),
  ('Andrés Mejía',   'Cardiología',       '204'),
  ('Sofía Herrera',  'Endocrinología',    '305'),
  ('Pedro Salazar',  'Medicina general',  '102');

INSERT INTO examenes (paciente_id, doctor_id, tipo, fecha, estado) VALUES
  (1,  1, 'Hemograma',               '2026-09-02', 'listo'),
  (2,  2, 'Electrocardiograma',      '2026-09-04', 'listo'),
  (3,  3, 'Glucosa en ayunas',       '2026-09-08', 'listo'),
  (4,  2, 'Perfil lipídico',         '2026-09-10', 'listo'),
  (5,  4, 'Hemograma',               '2026-09-15', 'cancelado'),
  (6,  3, 'TSH',                     '2026-09-18', 'listo'),
  (7,  1, 'Creatinina',              '2026-09-22', 'listo'),
  (8,  4, 'Uroanálisis',             '2026-09-25', 'listo'),
  (9,  2, 'Ecocardiograma',          '2026-10-01', 'pendiente'),
  (10, 3, 'Hemoglobina glicosilada', '2026-10-05', 'pendiente'),
  (1,  1, 'Perfil lipídico',         '2026-10-08', 'pendiente'),
  (2,  2, 'Holter 24 horas',         '2026-10-12', 'pendiente'),
  (4,  1, 'Hemograma',               '2026-10-14', 'cancelado'),
  (3,  3, 'Glucosa en ayunas',       '2026-10-16', 'pendiente'),
  (7,  1, 'Electrolitos',            '2026-10-20', 'pendiente');

INSERT INTO resultados (examen_id, diagnostico, valores, notas_medicas) VALUES
  (1, 'Anemia leve',               'Hemoglobina 11.2 g/dL',   'Iniciar hierro oral. Control en 3 meses.'),
  (2, 'Ritmo sinusal normal',      'FC 72 lpm',               'Sin hallazgos.'),
  (3, 'Prediabetes',               'Glucosa 112 mg/dL',       'Dieta y ejercicio. Repetir hemoglobina glicosilada.'),
  (4, 'Dislipidemia',              'LDL 168 mg/dL',           'Iniciar estatina.'),
  (6, 'Hipotiroidismo subclínico', 'TSH 6.8 mUI/L',           'Repetir en 6 semanas.'),
  (7, 'Función renal normal',      'Creatinina 0.9 mg/dL',    'Sin cambios.'),
  (8, 'Infección urinaria',        'Leucocitos 25 por campo', 'Antibiótico por 7 días.');

-- Capa de base de datos: el servidor MCP se conecta con este rol,
-- que solo puede LEER pacientes, doctores y examenes. Aunque el código fallara,
-- Postgres seguiría negando resultados y cualquier escritura.
CREATE ROLE mcp_reader LOGIN PASSWORD 'mcp_reader';
GRANT CONNECT ON DATABASE taller TO mcp_reader;
GRANT USAGE ON SCHEMA public TO mcp_reader;
GRANT SELECT ON pacientes, doctores, examenes TO mcp_reader;
