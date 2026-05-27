import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "./config/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });
const awsConfig = { region: process.env.AWS_REGION || "us-east-1" };
const s3Client = new S3Client(awsConfig);

// Setup DynamoDB & SNS
const dynamoClient = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const DYNAMO_TABLE_SESIONES = "sesiones-alumnos";

const snsClient = new SNSClient(awsConfig);

const mapAlumno = (row) => ({
  id: row.id,
  nombres: row.nombres,
  apellidos: row.apellidos,
  matricula: row.matricula,
  promedio: row.promedio,
  password: row.password,
  fotoPerfilUrl: row.fotoperfilurl
});

const mapProfesor = (row) => ({
  id: row.id,
  numeroEmpleado: row.numeroempleado,
  nombres: row.nombres,
  apellidos: row.apellidos,
  horasClase: row.horasclase
});

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
app.get("/alumnos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alumnos");
    res.status(200).json(result.rows.map(mapAlumno));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/alumnos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query("SELECT * FROM alumnos WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    res.status(200).json(mapAlumno(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/alumnos", async (req, res) => {
  const data = req.body;
  
  // Hacemos que password sea string predeterminado si no lo envían, en caso de test viejos
  const password = data.password ? String(data.password) : "defaultpass";

  if (
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.matricula || typeof(data.matricula) !== "string") ||
    (typeof(data.promedio) !== "number")
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  }
  
  try {
    const matriculaCheck = await pool.query("SELECT id FROM alumnos WHERE matricula = $1", [data.matricula]);
    if (matriculaCheck.rows.length > 0) return res.status(400).json({ error: "Ya existe un alumno con esa matrícula" });
    
    const result = await pool.query(
      "INSERT INTO alumnos (nombres, apellidos, matricula, promedio, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [data.nombres, data.apellidos, data.matricula, data.promedio, password]
    );
    res.status(201).json(mapAlumno(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/alumnos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  const password = data.password ? String(data.password) : "defaultpass";

  if (
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.matricula || typeof(data.matricula) !== "string") ||
    (typeof(data.promedio) !== "number")
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  }

  try {
    const checkUser = await pool.query("SELECT * FROM alumnos WHERE id = $1", [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const result = await pool.query(
      "UPDATE alumnos SET nombres = $1, apellidos = $2, matricula = $3, promedio = $4, password = $5 WHERE id = $6 RETURNING *",
      [data.nombres, data.apellidos, data.matricula, data.promedio, password, id]
    );
    res.status(200).json(mapAlumno(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/alumnos", (req, res) => {
  return res.status(405).json({ error: "Este método no está permitido" });
});

app.delete("/alumnos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const checkUser = await pool.query("SELECT * FROM alumnos WHERE id = $1", [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    await pool.query("DELETE FROM alumnos WHERE id = $1", [id]);
    res.status(200).json({ message: "Alumno eliminado", id: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Rutas Alumno Segunda Entrega

app.post("/alumnos/:id/fotoPerfil", upload.single("foto"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const resultCheck = await pool.query("SELECT * FROM alumnos WHERE id = $1", [id]);
    
    if (resultCheck.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó la imagen (campo 'foto')" });
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    const fileName = `alumnos/${id}-${Date.now()}-${req.file.originalname}`;
    
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read"
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const fotoPerfilUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
    
    await pool.query("UPDATE alumnos SET fotoperfilurl = $1 WHERE id = $2", [fotoPerfilUrl, id]);

    res.status(200).json({ fotoPerfilUrl });
  } catch (error) {
    console.error("Error subiendo foto de perfil:", error);
    res.status(500).json({ error: "Error interno al subir la imagen" });
  }
});


// Rutas de Sesión con DynamoDB
app.post("/alumnos/:id/session/login", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;
    
    const resultCheck = await pool.query("SELECT * FROM alumnos WHERE id = $1", [id]);
    if (resultCheck.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    
    const alumno = resultCheck.rows[0];
    if (alumno.password !== password) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const sessionId = uuidv4();
    const sessionString = crypto.randomBytes(64).toString('hex'); // 64 bytes = 128 caracteres en hex

    const nuevaSesion = {
      id: sessionId,
      fecha: Date.now(),
      alumnoId: id,
      active: true,
      sessionString: sessionString
    };

    await docClient.send(new PutCommand({
      TableName: DYNAMO_TABLE_SESIONES,
      Item: nuevaSesion
    }));

    res.status(200).json({ sessionString });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/alumnos/:id/session/verify", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sessionString } = req.body;

    const result = await docClient.send(new ScanCommand({
      TableName: DYNAMO_TABLE_SESIONES,
      FilterExpression: "sessionString = :ss AND alumnoId = :aid",
      ExpressionAttributeValues: {
        ":ss": sessionString,
        ":aid": id
      }
    }));

    const session = result.Items[0];
    if (session && session.active === true) {
      res.status(200).json({ valid: true });
    } else {
      res.status(400).json({ error: "Sesión inválida o inactiva" });
    }
  } catch (error) {
    console.error("Error en verify:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/alumnos/:id/session/logout", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sessionString } = req.body;

    const result = await docClient.send(new ScanCommand({
      TableName: DYNAMO_TABLE_SESIONES,
      FilterExpression: "sessionString = :ss AND alumnoId = :aid",
      ExpressionAttributeValues: {
        ":ss": sessionString,
        ":aid": id
      }
    }));

    const session = result.Items[0];
    if (!session) {
      return res.status(400).json({ error: "Sesión no encontrada para cerrar" });
    }

    await docClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE_SESIONES,
      Key: { id: session.id },
      UpdateExpression: "set active = :active",
      ExpressionAttributeValues: {
        ":active": false
      }
    }));

    res.status(200).json({ message: "Logout exitoso, sesión desactivada" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ error: error.message });
  }
});


// Ruta SNS - Enviar Email al alumno
app.post("/alumnos/:id/email", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Obtener los datos del alumno de PostgreSQL
    const resultCheck = await pool.query("SELECT * FROM alumnos WHERE id = $1", [id]);
    if (resultCheck.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    const alumno = resultCheck.rows[0];

    const topicArn = process.env.AWS_SNS_TOPIC_ARN;
    if (!topicArn) {
      return res.status(500).json({ error: "Falta configurar AWS_SNS_TOPIC_ARN en el archivo .env" });
    }

    // Preparar el mensaje con calificaciones e información
    const mensaje = `Hola,\n\nEsta es la información y calificaciones del alumno:\n\n` +
                    `Nombre completo: ${alumno.nombres} ${alumno.apellidos}\n` +
                    `Matrícula: ${alumno.matricula}\n` +
                    `Promedio Final: ${alumno.promedio}\n\n`;

    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: `Calificaciones de ${alumno.nombres} ${alumno.apellidos}`,
      Message: mensaje
    });

    await snsClient.send(command);

    res.status(200).json({ message: "Notificación SNS enviada correctamente al topic" });
  } catch (error) {
    console.error("Error enviando email via SNS:", error);
    res.status(500).json({ error: "Error interno al enviar la notificación SNS" });
  }
});


//Rutas Profesor
app.get("/profesores", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profesores");
    res.status(200).json(result.rows.map(mapProfesor));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/profesores/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query("SELECT * FROM profesores WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.status(200).json(mapProfesor(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/profesores", async (req, res) => {
  const data = req.body;
  if (
    (!data.numeroEmpleado || typeof(data.numeroEmpleado) !== "number" || !Number.isInteger(data.numeroEmpleado)) ||
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.horasClase || typeof(data.horasClase) !== "number" || !Number.isInteger(data.horasClase))
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  }

  try {
    const empCheck = await pool.query("SELECT id FROM profesores WHERE numeroEmpleado = $1", [data.numeroEmpleado]);
    if (empCheck.rows.length > 0) return res.status(400).json({ error: "Ya existe un profesor con ese número de empleado" });

    const result = await pool.query(
      "INSERT INTO profesores (numeroEmpleado, nombres, apellidos, horasClase) VALUES ($1, $2, $3, $4) RETURNING *",
      [data.numeroEmpleado, data.nombres, data.apellidos, data.horasClase]
    );
    return res.status(201).json(mapProfesor(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/profesores/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  
  if (
    (!data.numeroEmpleado || typeof(data.numeroEmpleado) !== "number" || !Number.isInteger(data.numeroEmpleado)) ||
    (!data.nombres || typeof(data.nombres) !== "string") ||
    (!data.apellidos || typeof(data.apellidos) !== "string") ||
    (!data.horasClase || typeof(data.horasClase) !== "number" || !Number.isInteger(data.horasClase))
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios o no son del tipo correcto" });
  }

  try {
    const profCheck = await pool.query("SELECT * FROM profesores WHERE id = $1", [id]);
    if (profCheck.rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    const result = await pool.query(
      "UPDATE profesores SET numeroEmpleado = $1, nombres = $2, apellidos = $3, horasClase = $4 WHERE id = $5 RETURNING *",
      [data.numeroEmpleado, data.nombres, data.apellidos, data.horasClase, id]
    );
    res.status(200).json(mapProfesor(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/profesores", (req, res) => {
  return res.status(405).json({ error: "Este método no está permitido" });
});

app.delete("/profesores/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const profCheck = await pool.query("SELECT * FROM profesores WHERE id = $1", [id]);
    if (profCheck.rows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    
    await pool.query("DELETE FROM profesores WHERE id = $1", [id]);
    res.status(200).json({ message: "Profesor eliminado", id: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
