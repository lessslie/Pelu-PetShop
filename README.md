🐾 PetShop y Peluquería Canina API 🐾
📋 Descripción
API REST para una tienda online de productos para mascotas y servicios de peluquería canina. Desarrollada con NestJS, TypeScript y Supabase.
✨ Características

🔐 Autenticación con JWT
👤 Gestión de usuarios (cliente y administrador)
🛍️ Catálogo de productos para mascotas
🛒 Sistema de carrito de compras
📅 Reserva de turnos para peluquería canina
📊 Panel de administración
📝 Documentación con Swagger

🚀 Tecnologías

⚡ NestJS + TypeScript
🔒 JWT y Bcrypt para autenticación
🗄️ Supabase (PostgreSQL)
📚 Swagger para documentación de API

🛠️ Instalación:
# Clonar el repositorio
git clone https://github.com/tu-usuario/petshop-backend.git

# Entrar en la carpeta
cd petshop-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env con las siguientes variables:
# SUPABASE_URL=tu_url_supabase
# SUPABASE_KEY=tu_key_supabase
# JWT_SECRET=tu_jwt_secret
# JWT_EXPIRATION=3600s
# PORT=3001

# Ejecutar en desarrollo
npm run start:dev

# Ejecutar en producción
npm run start
🌐 Endpoints
Autenticación

POST /auth/register - Registro de usuarios
POST /auth/login - Iniciar sesión

Usuarios

GET /users/profile - Obtener perfil
PUT /users/profile - Actualizar perfil

Productos

GET /products - Listar todos los productos
GET /products/:id - Obtener producto por ID
GET /products/category/:category - Filtrar por categoría
POST /products - Crear producto (admin)
PUT /products/:id - Actualizar producto (admin)
DELETE /products/:id - Eliminar producto (admin)

Pedidos

POST /orders - Crear pedido
GET /orders/my-orders - Mis pedidos
GET /orders/:id - Detalles de un pedido

Turnos para Peluquería

POST /turnos/appointment - Agendar turno
GET /turnos/appointments/:userId - Obtener turnos por usuario
GET /turnos/available-slots/:date - Obtener horarios disponibles
PUT /turnos/:id - Modificar turno
DELETE /turnos/:id - Cancelar turno

📋 Reglas de negocio

Los turnos de peluquería se pueden agendar de lunes a viernes entre las 8:00 y 18:00 horas
Cada turno tiene una duración de 1:30 horas
Solo se puede reservar un turno por hora y media
Los perros se clasifican por tamaño: pequeño, mediano, grande
Servicios disponibles: baño, baño y corte

📚 Documentación
Una vez iniciado el servidor, puedes acceder a la documentación de Swagger en:
http://localhost:3001/api
📝 Licencia
Este proyecto está bajo la Licencia MIT - consulta el archivo LICENSE para más detalles.
👨‍💻 Autor
Desarrollado por Agata


¡Gracias por usar nuestra API! Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue o contactarnos.