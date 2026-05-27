import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Requerido por AWS RDS muchas veces para conexiones externas
    }
});

// Probar la conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
    } else {
        console.log('✅ Conectado a la base de datos PostgreSQL en AWS');
        release();
    }
});

export default pool;
