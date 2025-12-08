# ElectroTech

Sistema integral de gestión para empresas de electrodomésticos, especializado en la administración de producción, facturación, inventario y reportes.

## Descripción del Proyecto

ElectroTech es una aplicación web full-stack desarrollada con Next.js que proporciona herramientas completas para gestionar:

- Producción de piezas y pinturas
- Catálogo de productos (maquinarias, marcas, tipos)
- Control de inventario y stock
- Facturación y remitos
- Gestión de clientes, empleados y proveedores
- Sistema de reportes y análisis de ventas
- Control de acceso basado en roles (RBAC)

## Características Principales

- Autenticación y autorización con JWT
- Sistema RBAC (Role-Based Access Control) completo
- Interfaz responsiva con Tailwind CSS y componentes Radix UI
- API REST con rutas dinámicas
- Generación de reportes en PDF
- Cálculo automático de consumo de pintura
- Auditoría de sesiones de usuario
- Gestión de permisos granulares por grupo

## Tecnologías Utilizadas

### Frontend
- Next.js 16.0.3
- React 19.2.0
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes UI construidos sobre Radix UI)
- Recharts (gráficos)

### Backend
- Next.js API Routes
- MySQL 2
- JWT (jsonwebtoken)
- Bcryptjs (encriptación)
- Nodemailer (correos)
- jsPDF (generación de PDFs)

### Herramientas de Desarrollo
- ESLint
- Babel React Compiler
- PostCSS

## Estructura del Proyecto
├── src/
│ ├── app/ # Next.js app directory
│ │ ├── api/ # Rutas API
│ │ ├── dashboard/ # Dashboards por rol
│ │ ├── auth/ # Páginas de autenticación
│ │ └── [features]/ # Módulos funcionales
│ ├── components/ # Componentes React reutilizables
│ │ ├── ui/ # Componentes shadcn/ui
│ │ └── [features]/ # Componentes de features específicas
│ ├── domain/ # Lógica de negocio y patrones
│ ├── lib/ # Utilidades y funciones auxiliares
│ └── middleware.ts # Middleware de autenticación
├── database/ # Scripts SQL y esquemas
├── public/ # Archivos estáticos
└── components.json # Configuración de shadcn/ui

## Módulos Principales

### Piezas y Pinturas
Gestión de piezas, pinturas y piezas pintadas con cálculo automático de consumo según densidad.

### Facturación
Sistema completo de creación y seguimiento de facturas y remitos.

### Productos
Administración de marcas, tipos y colores.

### Reportes
Análisis de ventas, consumo de pintura y evolución por cliente.

### Administración
Gestión de usuarios, grupos y permisos del sistema.

## Requisitos Previos

- Node.js 18+
- npm o yarn
- MySQL 8.0+

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Sap3252/electrotech.git
cd electrotech

2. Instalar dependencias:
npm install

3. Configurar variables de entorno (.env.local):
DATABASE_URL=mysql://usuario:password@localhost:3306/electrotech
JWT_SECRET=tu_secret_jwt
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_password

4. Configurar base de datos:
mysql -u usuario -p electrotech < database/rbac-completo.sql

5. Iniciar servidor de desarrollo:
npm run dev

La aplicación estará disponible en http://localhost:3000


Sistema RBAC
El sistema utiliza control de acceso basado en roles con:

4 módulos principales
15 formularios
24 componentes
Permisos granulares por grupo
Vistas de auditoría
Ver README.md para documentación detallada del RBAC.

Patrones de Diseño
Strategy Pattern: Cálculo de consumo de pintura
Composite Pattern: RBAC y login
Protected Routes: Componentes y páginas protegidas

Base de Datos
El proyecto incluye dos scripts SQL principales:

electrotech-schema.sql - Esquema base
rbac-completo.sql - Sistema RBAC completo y listo para usar

Contribución
Las contribuciones son bienvenidas. Por favor:

Fork el proyecto
Crea una rama para tu feature (git checkout -b feature/AmazingFeature)
Commit tus cambios (git commit -m 'Add AmazingFeature')
Push a la rama (git push origin feature/AmazingFeature)
Abre un Pull Request

Licencia
Este proyecto está licenciado bajo la Licencia MIT.

Autores
Santiago Passerini y Ignacio Criscenti

Contacto
Para preguntas o soporte, abre un issue en el repositorio.
