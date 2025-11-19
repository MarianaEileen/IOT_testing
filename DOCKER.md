# Guía de Docker - Ultra Básico

## ¿Qué es Docker?

Docker es como una "caja mágica" que empaqueta tu aplicación con todo lo que necesita para funcionar (código, dependencias, configuración) y la ejecuta de forma aislada, sin importar en qué computadora estés.

**Ventaja principal**: "Funciona en mi máquina" = "Funciona en TODAS las máquinas" 🎉

---

## 📦 Conceptos Básicos

### 🏗️ Dockerfile
Es la "receta" para construir tu aplicación. Define:
- Qué sistema operativo usar
- Qué dependencias instalar
- Qué comandos ejecutar al iniciar

### 🐳 Imagen
Es el resultado de "cocinar" la receta (Dockerfile). Es como una plantilla lista para usar.

### 📦 Contenedor
Es la aplicación corriendo desde una imagen. Puedes crear muchos contenedores desde la misma imagen.

### 🎼 docker-compose.yml
Archivo que organiza múltiples servicios (frontend, backend, base de datos) para que trabajen juntos.

---

## 🚀 Comandos Esenciales

### 1️⃣ Levantar la Aplicación

```bash
docker-compose up
```

**¿Qué hace?**
- Construye las imágenes (si no existen)
- Crea y arranca los contenedores
- Muestra los logs en tiempo real

**Opciones útiles:**
```bash
docker-compose up -d          # Modo "detached" (en segundo plano)
docker-compose up --build     # Reconstruir imágenes antes de iniciar
```

---

### 2️⃣ Ver Logs (Mensajes de la App)

```bash
docker-compose logs -f
```

**Explicación:**
- `-f` = "follow" (sigue mostrando nuevos mensajes en tiempo real)
- Útil para ver errores o depurar

**Ver logs de un servicio específico:**
```bash
docker-compose logs -f app    # Solo logs del contenedor 'app'
```

---

### 3️⃣ Detener la Aplicación

```bash
docker-compose down
```

**¿Qué hace?**
- Para todos los contenedores
- Los elimina (pero conserva las imágenes)
- Limpia la red creada

**Detener sin eliminar:**
```bash
docker-compose stop           # Solo pausa los contenedores
```

---

### 4️⃣ Reiniciar Después de Cambios en el Código

```bash
docker-compose restart
```

**¿Cuándo usarlo?**
- Hiciste cambios en `src/` o `server/`
- Los volúmenes de Docker sincronizan automáticamente los archivos
- Un restart aplica los cambios sin reconstruir

**Si cambiaste el Dockerfile o package.json:**
```bash
docker-compose down
docker-compose up --build
```

---

### 5️⃣ Ver Contenedores Activos

```bash
docker-compose ps
```

**Salida esperada:**
```
NAME                  STATUS              PORTS
iot-dashboard-app-1   Up 5 minutes        0.0.0.0:4200->4200/tcp, 0.0.0.0:5000->5000/tcp
```

---

### 6️⃣ Reconstruir Imágenes

```bash
docker-compose build
```

**¿Cuándo usarlo?**
- Modificaste el `Dockerfile`
- Cambiaste dependencias en `package.json`
- Actualizaste scripts de inicio

---

## 🔧 Comandos de Mantenimiento

### Limpiar Todo (Contenedores, Redes, Volúmenes)

```bash
docker-compose down -v
```

**⚠️ CUIDADO:** `-v` elimina volúmenes (datos persistentes).

---

### Ver Imágenes Descargadas

```bash
docker images
```

---

### Eliminar Imágenes Huérfanas

```bash
docker image prune
```

---

### Acceder al Terminal de un Contenedor

```bash
docker-compose exec app sh
```

**Uso:**
- Explorar archivos dentro del contenedor
- Ejecutar comandos manualmente
- Depurar problemas

**Salir del contenedor:**
```bash
exit
```

---

## 🎯 Flujo de Trabajo Típico

### Primera Vez (Setup Inicial)

```bash
# 1. Clonar repositorio
git clone <tu-repo>
cd IOT_testing

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Levantar aplicación
docker-compose up -d

# 4. Ver logs para verificar
docker-compose logs -f
```

---

### Desarrollo Diario

```bash
# Iniciar aplicación
docker-compose up -d

# Ver logs si hay problemas
docker-compose logs -f

# Hacer cambios en src/ o server/
# (Los cambios se aplican automáticamente por los volúmenes)

# Reiniciar si es necesario
docker-compose restart

# Detener al terminar
docker-compose down
```

---

### Solución de Problemas

```bash
# 1. Ver logs completos
docker-compose logs

# 2. Verificar estado de contenedores
docker-compose ps

# 3. Reiniciar desde cero
docker-compose down
docker-compose up --build

# 4. Si sigue fallando, limpiar todo
docker-compose down -v
docker system prune -a  # ⚠️ Elimina TODAS las imágenes no usadas
docker-compose up --build
```

---

## 🌐 Acceder a la Aplicación

Después de `docker-compose up`:

- **Frontend (Angular):** http://localhost:4200
- **Backend (API):** http://localhost:5000/api

**Verificar que funciona:**
```bash
curl http://localhost:5000/api/sensors
```

---

## 📝 Notas Importantes

1. **Puertos ocupados:** Si `4200` o `5000` están en uso:
   ```bash
   docker-compose down        # Detener contenedores existentes
   # O cambiar puertos en docker-compose.yml
   ```

2. **Cambios no se reflejan:**
   - Verifica que los volúmenes estén montados en `docker-compose.yml`
   - Haz `docker-compose restart`

3. **Base de datos no conecta:**
   - Verifica `.env` con las credenciales correctas
   - Ejecuta `npm run diagnose` (dentro del contenedor o localmente)

4. **Problemas de permisos (Linux/Mac):**
   ```bash
   sudo docker-compose up
   ```

---

## 🎓 Comandos en Una Tabla

| Comando | Descripción |
|---------|-------------|
| `docker-compose up` | Inicia todo |
| `docker-compose up -d` | Inicia en segundo plano |
| `docker-compose down` | Detiene y elimina contenedores |
| `docker-compose logs -f` | Ver logs en tiempo real |
| `docker-compose restart` | Reinicia contenedores |
| `docker-compose ps` | Ver contenedores activos |
| `docker-compose build` | Reconstruir imágenes |
| `docker-compose exec app sh` | Entrar al contenedor |

---

## ✅ Checklist de Inicio Rápido

- [ ] Docker Desktop instalado y corriendo
- [ ] Archivo `.env` configurado (copiar de `.env.example`)
- [ ] Ejecutar `docker-compose up -d`
- [ ] Abrir http://localhost:4200 en el navegador
- [ ] Ver logs con `docker-compose logs -f` si hay problemas

---

¡Listo! Con estos comandos puedes gestionar toda tu aplicación IoT con Docker. 🚀
