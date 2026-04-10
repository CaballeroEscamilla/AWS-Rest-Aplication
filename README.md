# REST Application con Express

Una aplicación API REST simple construida con Node.js y Express.

## Requisitos

- Node.js (v12 o superior)
- npm

## Instalación

```bash
npm install
```

## Ejecución

### Modo producción
```bash
npm start
```

### Modo desarrollo (con nodemon)
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
RestAplication/
├── index.js          # Archivo principal
├── package.json      # Dependencias del proyecto
├── .gitignore        # Archivos a ignorar en Git
└── README.md         # Este archivo
```

## Rutas

- `GET /` - Ruta raíz de bienvenida

## Próximos Pasos

- Añadir más rutas según sea necesario
- Implementar manejo de errores más robusto
- Añadir validación de datos
- Conectar a una base de datos
