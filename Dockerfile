# Etapa de desarrollo y construcción
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias, incluyendo las devDependencies
RUN npm install

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo las dependencias de producción
RUN npm ci --omit=dev

# Copia el código compilado
COPY --from=build /usr/src/app/dist ./dist

# Copia el archivo servicios.json a la misma ruta que espera el backend
COPY src/servicios/servicios.json ./src/servicios/servicios.json

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]