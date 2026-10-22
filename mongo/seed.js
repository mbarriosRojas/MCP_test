// Carga los datos de ejemplo de la clínica en MongoDB (lo corre el facilitador, una sola vez).
// Todos los datos son ficticios.
// Necesita un usuario con permiso de escritura, NO el usuario de solo lectura del taller:
//   MONGODB_ADMIN_URI="mongodb+srv://admin:...@cluster.mongodb.net" npm run mongo:seed

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_ADMIN_URI;
if (!uri) {
  console.error("Falta MONGODB_ADMIN_URI.");
  process.exit(1);
}

const pacientes = [
  { id: 1, nombre: "Ana Gómez", edad: 34, eps: "Sura", ciudad: "Medellín" },
  { id: 2, nombre: "Carlos Ruiz", edad: 58, eps: "Sanitas", ciudad: "Bogotá" },
  { id: 3, nombre: "Diana López", edad: 45, eps: "Nueva EPS", ciudad: "Cali" },
  { id: 4, nombre: "Esteban Mora", edad: 67, eps: "Sura", ciudad: "Medellín" },
  { id: 5, nombre: "Felipe Torres", edad: 29, eps: "Compensar", ciudad: "Bogotá" },
  { id: 6, nombre: "Gabriela Castro", edad: 52, eps: "Sanitas", ciudad: "Barranquilla" },
  { id: 7, nombre: "Héctor Salas", edad: 71, eps: "Nueva EPS", ciudad: "Cali" },
  { id: 8, nombre: "Isabel Vargas", edad: 38, eps: "Compensar", ciudad: "Bogotá" },
  { id: 9, nombre: "Juan Pérez", edad: 61, eps: "Sura", ciudad: "Medellín" },
  { id: 10, nombre: "Karen Ospina", edad: 25, eps: "Sanitas", ciudad: "Bogotá" },
];

const doctores = [
  { id: 1, nombre: "Laura Ríos", especialidad: "Medicina interna", consultorio: "101" },
  { id: 2, nombre: "Andrés Mejía", especialidad: "Cardiología", consultorio: "204" },
  { id: 3, nombre: "Sofía Herrera", especialidad: "Endocrinología", consultorio: "305" },
  { id: 4, nombre: "Pedro Salazar", especialidad: "Medicina general", consultorio: "102" },
];

const examenes = [
  { id: 1, paciente_id: 1, doctor_id: 1, tipo: "Hemograma", fecha: "2026-09-02", estado: "listo" },
  { id: 2, paciente_id: 2, doctor_id: 2, tipo: "Electrocardiograma", fecha: "2026-09-04", estado: "listo" },
  { id: 3, paciente_id: 3, doctor_id: 3, tipo: "Glucosa en ayunas", fecha: "2026-09-08", estado: "listo" },
  { id: 4, paciente_id: 4, doctor_id: 2, tipo: "Perfil lipídico", fecha: "2026-09-10", estado: "listo" },
  { id: 5, paciente_id: 5, doctor_id: 4, tipo: "Hemograma", fecha: "2026-09-15", estado: "cancelado" },
  { id: 6, paciente_id: 6, doctor_id: 3, tipo: "TSH", fecha: "2026-09-18", estado: "listo" },
  { id: 7, paciente_id: 7, doctor_id: 1, tipo: "Creatinina", fecha: "2026-09-22", estado: "listo" },
  { id: 8, paciente_id: 8, doctor_id: 4, tipo: "Uroanálisis", fecha: "2026-09-25", estado: "listo" },
  { id: 9, paciente_id: 9, doctor_id: 2, tipo: "Ecocardiograma", fecha: "2026-10-01", estado: "pendiente" },
  { id: 10, paciente_id: 10, doctor_id: 3, tipo: "Hemoglobina glicosilada", fecha: "2026-10-05", estado: "pendiente" },
  { id: 11, paciente_id: 1, doctor_id: 1, tipo: "Perfil lipídico", fecha: "2026-10-08", estado: "pendiente" },
  { id: 12, paciente_id: 2, doctor_id: 2, tipo: "Holter 24 horas", fecha: "2026-10-12", estado: "pendiente" },
  { id: 13, paciente_id: 4, doctor_id: 1, tipo: "Hemograma", fecha: "2026-10-14", estado: "cancelado" },
  { id: 14, paciente_id: 3, doctor_id: 3, tipo: "Glucosa en ayunas", fecha: "2026-10-16", estado: "pendiente" },
  { id: 15, paciente_id: 7, doctor_id: 1, tipo: "Electrolitos", fecha: "2026-10-20", estado: "pendiente" },
];

const resultados = [
  { examen_id: 1, diagnostico: "Anemia leve", valores: "Hemoglobina 11.2 g/dL", notas_medicas: "Iniciar hierro oral. Control en 3 meses." },
  { examen_id: 2, diagnostico: "Ritmo sinusal normal", valores: "FC 72 lpm", notas_medicas: "Sin hallazgos." },
  { examen_id: 3, diagnostico: "Prediabetes", valores: "Glucosa 112 mg/dL", notas_medicas: "Dieta y ejercicio. Repetir hemoglobina glicosilada." },
  { examen_id: 4, diagnostico: "Dislipidemia", valores: "LDL 168 mg/dL", notas_medicas: "Iniciar estatina." },
  { examen_id: 6, diagnostico: "Hipotiroidismo subclínico", valores: "TSH 6.8 mUI/L", notas_medicas: "Repetir en 6 semanas." },
  { examen_id: 7, diagnostico: "Función renal normal", valores: "Creatinina 0.9 mg/dL", notas_medicas: "Sin cambios." },
  { examen_id: 8, diagnostico: "Infección urinaria", valores: "Leucocitos 25 por campo", notas_medicas: "Antibiótico por 7 días." },
];

const client = new MongoClient(uri);
const db = client.db("taller");
for (const [nombre, documentos] of Object.entries({ pacientes, doctores, examenes, resultados })) {
  await db.collection(nombre).deleteMany({});
  await db.collection(nombre).insertMany(documentos);
  console.log(`${nombre}: ${documentos.length} documentos`);
}
await client.close();
