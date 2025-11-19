# Dockerfile simple - Todo en un contenedor
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Exponer puertos (frontend 4200, backend 5000)
EXPOSE 4200 5000

# Crear script de inicio directamente
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'node server/index.js &' >> /start.sh && \
    echo 'npm run dev -- --host 0.0.0.0' >> /start.sh && \
    chmod +x /start.sh

# Iniciar ambos servicios
CMD ["/bin/sh", "/start.sh"]
