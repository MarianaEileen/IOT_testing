# 🌡️ IoT Sensor Dashboard

Dashboard en tiempo real para monitorear sensores de temperatura/humedad y controlar dispositivos IoT con PostgreSQL.

## 🏗️ ¿Cómo funciona?

```
Navegador (Angular) → Backend (Node.js) → PostgreSQL (AWS)
    Puerto 4200          Puerto 5000         Tu base de datos
```

**Todo corre en un solo contenedor Docker** 🐳

---

## 🚀 Inicio Rápido con Docker

### 1. Configurar credenciales de PostgreSQL

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus credenciales de AWS
```

Tu `.env` debe verse así:
```env
DB_HOST=tu-ip-o-host-aws
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=bienestar_db
DB_SSL=false
```

### 2. Crear tabla en PostgreSQL (solo primera vez)

Ejecuta el script SQL en tu base de datos:
```bash
psql -h tu-host -U usuario -d bienestar_db -f database/schema.sql
```

O copia y pega el contenido de `database/schema.sql` en tu cliente PostgreSQL.

### 3. Iniciar todo con Docker

```bash
docker-compose up -d
```

**¡Listo!** Abre tu navegador en: **http://localhost:4200**

---

## 📡 API Endpoints

El backend expone estos endpoints:

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/sensor` | Última lectura de temperatura/humedad |
| GET | `/api/sensor/history?limit=100` | Historial de lecturas |
| POST | `/api/sensor` | Guardar nueva lectura (para IoT devices) |
| POST | `/api/led` | Controlar LED (body: `{"action":"on"}`) |
| GET | `/api/led` | Estado actual del LED |
| GET | `/health` | Health check del servidor |

---

## 🛠️ Comandos Útiles

```bash
# Iniciar
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Ver estado
docker ps
```

---

## 🔧 Desarrollo sin Docker (opcional)

Si prefieres correr sin Docker:

```bash
# Instalar dependencias
npm install

# Probar conexión a DB
npm run diagnose

# Iniciar frontend + backend
npm start
```

---

## 📁 Estructura del Proyecto

```
├── server/               # Backend (Node.js + Express)
│   ├── index.js         # Servidor principal
│   ├── config/          # Configuración PostgreSQL
│   ├── controllers/     # Lógica de negocio
│   └── routes/          # Rutas API
├── src/                 # Frontend (Angular)
│   ├── components/      # Componentes UI
│   └── services/        # Servicios HTTP
├── database/            # Scripts SQL
├── Dockerfile           # Contenedor único
├── docker-compose.yml   # Orquestación Docker
└── .env                 # Variables de entorno (NO subir a git)
```

---

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
- Usa variables de entorno para credenciales
- En producción, usa SSL para PostgreSQL (`DB_SSL=true`)

---

## 🚢 Para compartir con otros

Otros solo necesitan:

```bash
git clone tu-repositorio
cp .env.example .env
# Editar .env con sus credenciales
docker-compose up -d
```

---

## 🔧 Tecnologías

- **Frontend**: Angular 20, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL driver (pg)
- **Base de datos**: PostgreSQL 16+
- **Containerización**: Docker

---

## 📊 Tabla de PostgreSQL

Tu tabla `sensor_temp` debe tener esta estructura:

```sql
CREATE TABLE sensor_temp (
    temperature FLOAT NOT NULL,
    humidity FLOAT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ❓ Troubleshooting

**Error de conexión a DB:**
```bash
npm run diagnose  # Diagnostica la conexión
```

**Puerto ya en uso:**
```bash
# Detén otros contenedores
docker-compose down
docker ps -a  # Ver contenedores
```

**Ver logs del contenedor:**
```bash
docker-compose logs -f
```
