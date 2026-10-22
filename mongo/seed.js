// Carga los datos de ejemplo en MongoDB (lo corre el facilitador, una sola vez).
// Necesita un usuario con permiso de escritura, NO el usuario de solo lectura del taller:
//   MONGODB_ADMIN_URI="mongodb+srv://admin:...@cluster.mongodb.net" npm run mongo:seed

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_ADMIN_URI;
if (!uri) {
  console.error("Falta MONGODB_ADMIN_URI.");
  process.exit(1);
}

const productos = [
  { id: 1, nombre: "Laptop Pro 14", categoria: "computadores", precio: 1899.0, stock: 12 },
  { id: 2, nombre: 'Monitor 27" 4K', categoria: "monitores", precio: 429.9, stock: 30 },
  { id: 3, nombre: "Teclado mecánico", categoria: "accesorios", precio: 89.5, stock: 75 },
  { id: 4, nombre: "Mouse inalámbrico", categoria: "accesorios", precio: 34.99, stock: 120 },
  { id: 5, nombre: "Audífonos ANC", categoria: "audio", precio: 249.0, stock: 40 },
  { id: 6, nombre: "Webcam Full HD", categoria: "accesorios", precio: 59.0, stock: 55 },
  { id: 7, nombre: "Silla ergonómica", categoria: "mobiliario", precio: 349.0, stock: 18 },
  { id: 8, nombre: "Escritorio elevable", categoria: "mobiliario", precio: 529.0, stock: 9 },
  { id: 9, nombre: "Disco SSD 1TB", categoria: "almacenamiento", precio: 99.9, stock: 64 },
  { id: 10, nombre: 'Tablet 11"', categoria: "computadores", precio: 599.0, stock: 22 },
];

const pedidos = [
  { id: 1, producto_id: 1, cliente: "Andrea Gómez", vendedor: "Laura", cantidad: 1, estado: "entregado", fecha: "2026-09-02" },
  { id: 2, producto_id: 3, cliente: "Carlos Ruiz", vendedor: "Pedro", cantidad: 2, estado: "entregado", fecha: "2026-09-05" },
  { id: 3, producto_id: 2, cliente: "Diana López", vendedor: "Laura", cantidad: 2, estado: "enviado", fecha: "2026-09-11" },
  { id: 4, producto_id: 5, cliente: "Esteban Mora", vendedor: "Sofía", cantidad: 1, estado: "cancelado", fecha: "2026-09-14" },
  { id: 5, producto_id: 4, cliente: "Felipe Torres", vendedor: "Pedro", cantidad: 3, estado: "entregado", fecha: "2026-09-18" },
  { id: 6, producto_id: 7, cliente: "Gabriela Ríos", vendedor: "Laura", cantidad: 1, estado: "enviado", fecha: "2026-09-23" },
  { id: 7, producto_id: 9, cliente: "Héctor Salas", vendedor: "Sofía", cantidad: 4, estado: "entregado", fecha: "2026-09-29" },
  { id: 8, producto_id: 10, cliente: "Isabel Vargas", vendedor: "Laura", cantidad: 1, estado: "pendiente", fecha: "2026-10-03" },
  { id: 9, producto_id: 6, cliente: "Juan Pérez", vendedor: "Pedro", cantidad: 2, estado: "cancelado", fecha: "2026-10-08" },
  { id: 10, producto_id: 8, cliente: "Karen Castro", vendedor: "Sofía", cantidad: 1, estado: "pendiente", fecha: "2026-10-12" },
];

const salarios = [
  { vendedor: "Laura", salario_mensual: 4200.0, cuenta_bancaria: "0011-2233-4455" },
  { vendedor: "Pedro", salario_mensual: 3800.0, cuenta_bancaria: "0099-8877-6655" },
  { vendedor: "Sofía", salario_mensual: 4000.0, cuenta_bancaria: "0055-6677-8899" },
];

const client = new MongoClient(uri);
const db = client.db("tienda");
for (const [nombre, documentos] of Object.entries({ productos, pedidos, salarios })) {
  await db.collection(nombre).deleteMany({});
  await db.collection(nombre).insertMany(documentos);
  console.log(`${nombre}: ${documentos.length} documentos`);
}
await client.close();
