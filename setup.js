import pool from "./config/database.js";

const createTables = async () => {
  try {
    console.log("Conectando a AWS RDS para crear tablas...");
    
    // Crear tabla alumnos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id SERIAL PRIMARY KEY,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        matricula VARCHAR(50) UNIQUE NOT NULL,
        promedio REAL NOT NULL,
        password VARCHAR(255) NOT NULL,
        fotoperfilurl VARCHAR(500)
      );
    `);
    console.log("Tabla 'alumnos' creada o ya existente.");

    // Crear tabla profesores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profesores (
        id SERIAL PRIMARY KEY,
        numeroEmpleado INT UNIQUE NOT NULL,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        horasClase INT NOT NULL
      );
    `);
    console.log("Tabla 'profesores' creada o ya existente.");

  } catch (error) {
    console.error("Error creando las tablas:", error);
  } finally {
    // Cerramos la conexión para que el script termine
    pool.end();
    console.log("Proceso de inicialización finalizado.");
  }
};

createTables();
