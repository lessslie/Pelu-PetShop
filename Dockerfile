# Usamos la imagen oficial de Node.js como base
FROM node:20-alpine AS development

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos el package.json y package-lock.json
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Construimos la aplicación
RUN npm run build

# Segunda etapa: para producción, necesitamos menos paquetes
FROM node:20-alpine AS production

# Definimos NODE_ENV
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos el package.json y package-lock.json
COPY package*.json ./

# Instalamos solo las dependencias de producción
RUN npm ci --only=production

# Copiamos el código compilado desde la etapa de desarrollo
COPY --from=development /usr/src/app/dist ./dist

# Exponemos el puerto que usa la aplicación
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]