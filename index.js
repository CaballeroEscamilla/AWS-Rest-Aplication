import express from "express";

import Alumno from "./Objetos/Alumno.js";
import Profesor from "./Objetos/Profesor.js";
import Alumnos from "./Arrays/Alumnos.js";
import Profesores from "./Arrays/Profesores.js";

const app = express();
const PORT = process.env.PORT || 3000;

const alumnos = new Alumnos();
const profesores = new Profesores();

// Middleware
app.use(express.json());

// Rutas
app.get("/", (req, res) => {
  res.json({ 
    message: "¡Bienvenido a tu API REST con Express!",
    disponibleMethods: {
      alumnos: {
        "GET /alumnos": "Obtiene la lista de todos los alumnos",
        "GET /alumnos/:id": "Obtiene un alumno específico por ID",
        "POST /alumnos": "Crea un nuevo alumno",
        "PUT /alumnos/:id": "Actualiza un alumno existente",
        "DELETE /alumnos/:id": "Elimina un alumno"
      },
      profesores: {
        "GET /profesores": "Obtiene la lista de todos los profesores",
        "GET /profesores/:id": "Obtiene un profesor específico por ID",
        "POST /profesores": "Crea un nuevo profesor",
        "PUT /profesores/:id": "Actualiza un profesor existente",
        "DELETE /profesores/:id": "Elimina un profesor"
      }
    }
  });
});

//Rutas alumno
app.get("/alumnos", (req, res) => {
  res.status(200).json(alumnos.getAlumnos());
});

app.get("/alumnos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const alumno = alumnos.getAlumnos().find((a) => a.id === id);
  if (!alumno) {
    return res.status(404).json({ error: "Alumno no encontrado" });
  }
  try {
    res.status(200).json(alumno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/alumnos", (req, res) => {
  const data = req.body;
  if (
    (!data.id || typeof(data.id) !== "number" || !Number.isInteger(data.id)) ||
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.matricula || typeof(data.matricula) !== "string") ||
    (!data.promedio || typeof(data.promedio) !== "number")
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  } else {
    if (alumnos.getAlumnos().some(a => a.id === data.id)) {
      return res.status(400).json({ error: "Ya existe un alumno con ese ID" });
    } else if (alumnos.getAlumnos().some(a => a.matricula === data.matricula)) {
      return res.status(400).json({ error: "Ya existe un alumno con esa matrícula" });
    }
    const alumno = new Alumno(
      data.id,
      data.nombres,
      data.apellidos,
      data.matricula,
      data.promedio,
    );
    try {
      alumnos.addAlumno(alumno);
      res.status(201).json(alumno);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.put("/alumnos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  const alumnoExistente = alumnos.getAlumnos().find((a) => a.id === id);
  if (!alumnoExistente) {
      return res.status(404).json({ error: "Alumno no encontrado" });
  }
  if (
    (!data.id || typeof(data.id) !== "number" || !Number.isInteger(data.id)) ||
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.matricula || typeof(data.matricula) !== "string") ||
    (!data.promedio || typeof(data.promedio) !== "number")
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  }
  const alumno = new Alumno(
    data.id,
    data.nombres,
    data.apellidos,
    data.matricula,
    data.promedio
  );
  try {
    alumnos.updateAlumno(id, alumno);
    res.status(200).json(alumno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/alumnos", (req, res) => {
  return res.status(405).json({ error: "Este método no está permitido" });
});

app.delete("/alumnos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const alumnoExistente = alumnos.getAlumnos().find((a) => a.id === id);
  if (!alumnoExistente) {
    return res.status(404).json({ error: "Alumno no encontrado" });
  }
  try {
    alumnos.deleteAlumno(id);
    res.status(200).json({ message: "Alumno eliminado", id: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Rutas Profesor
app.get("/profesores", (req, res) => {
  res.status(200).json(profesores.getProfesores());
});

app.get("/profesores/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const profesor = profesores.getProfesores().find((p) => p.id === id);
  if (!profesor) {
    return res.status(404).json({ error: "Profesor no encontrado" });
  }
  try {
    res.status(200).json(profesor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/profesores", (req, res) => {
  const data = req.body;
  if (
    (!data.id || typeof(data.id) !== "number" || !Number.isInteger(data.id)) ||
    (!data.numeroEmpleado || typeof(data.numeroEmpleado) !== "number" || !Number.isInteger(data.numeroEmpleado)) ||
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.horasClase || typeof(data.horasClase) !== "number" || !Number.isInteger(data.horasClase))
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  } else {
    if (profesores.getProfesores().some(p => p.id === data.id)) {
      return res.status(400).json({ error: "Ya existe un profesor con ese ID" });
    } else if (profesores.getProfesores().some(p => p.numeroEmpleado === data.numeroEmpleado)) {
      return res.status(400).json({ error: "Ya existe un profesor con ese número de empleado" });
    }
    const profesor = new Profesor(
      data.id,
      data.numeroEmpleado,
      data.nombres,
      data.apellidos,
      data.horasClase
    );
    try {
      profesores.addProfesor(profesor);
      return res.status(201).json(profesor);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

app.put("/profesores/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const profesorExistente = profesores.getProfesores().find((p) => p.id === id);
  if (!profesorExistente) {
      return res.status(404).json({ error: "Profesor no encontrado" });
  }
  const data = req.body;
  if (
    (!data.id || typeof(data.id) !== "number" || !Number.isInteger(data.id)) ||
    (!data.numeroEmpleado || typeof(data.numeroEmpleado) !== "number" || !Number.isInteger(data.numeroEmpleado)) ||
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.horasClase || typeof(data.horasClase) !== "number" || !Number.isInteger(data.horasClase))
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  }
  const profesor = new Profesor(
    data.id,
    data.numeroEmpleado,
    data.nombres,
    data.apellidos,
    data.horasClase
  );
  try {
    profesores.updateProfesor(id, profesor);
    res.status(200).json(profesor);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/profesores", (req, res) => {
  return res.status(405).json({ error: "Este método no está permitido" });
});

app.delete("/profesores/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const profesorExistente = profesores.getProfesores().find((p) => p.id === id);
  if (!profesorExistente) {
    return res.status(404).json({ error: "Profesor no encontrado" });
  }
  try {
    profesores.deleteProfesor(id);
    res.status(200).json({ message: "Profesor eliminado", id: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
