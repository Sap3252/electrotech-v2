-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: electrotech2
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `componente`
--

DROP TABLE IF EXISTS `componente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `componente` (
  `id_componente` int NOT NULL AUTO_INCREMENT,
  `id_formulario` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo` enum('boton','tabla','formulario','seccion','acceso','otro') DEFAULT 'otro',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_componente`),
  UNIQUE KEY `uk_componente` (`id_formulario`,`nombre`),
  CONSTRAINT `componente_ibfk_1` FOREIGN KEY (`id_formulario`) REFERENCES `formulario` (`id_formulario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `componente`
--

LOCK TABLES `componente` WRITE;
/*!40000 ALTER TABLE `componente` DISABLE KEYS */;
INSERT INTO `componente` VALUES (1,1,'Formulario Nueva Pieza',NULL,'formulario',1,'2025-12-03 17:35:55'),(2,1,'Tabla Listado Piezas',NULL,'tabla',1,'2025-12-03 17:35:55'),(3,1,'Botón Editar Pieza',NULL,'boton',1,'2025-12-03 17:35:55'),(4,1,'Botón Eliminar Pieza',NULL,'boton',1,'2025-12-03 17:35:55'),(5,2,'Formulario Nueva Pintura',NULL,'formulario',1,'2025-12-03 17:35:55'),(6,2,'Tabla Listado Pinturas',NULL,'tabla',1,'2025-12-03 17:35:55'),(7,2,'Botón Eliminar Pintura',NULL,'boton',1,'2025-12-03 17:35:55'),(8,3,'Formulario Registrar Producción',NULL,'formulario',1,'2025-12-03 17:35:55'),(9,3,'Tabla Historial Producción',NULL,'tabla',1,'2025-12-03 17:35:55'),(10,5,'Formulario Cargar Remito',NULL,'formulario',1,'2025-12-03 17:35:55'),(11,5,'Tabla Listado Remitos',NULL,'tabla',1,'2025-12-03 17:35:55'),(12,5,'Botón Ver Detalle',NULL,'boton',1,'2025-12-03 17:35:55'),(13,5,'Botón Imprimir PDF',NULL,'boton',1,'2025-12-03 17:35:55'),(14,6,'Formulario Generar Factura',NULL,'formulario',1,'2025-12-03 17:35:55'),(15,6,'Tabla Listado Facturas',NULL,'tabla',1,'2025-12-03 17:35:55'),(16,6,'Botón Ver Detalle Factura',NULL,'boton',1,'2025-12-03 17:35:55'),(17,6,'Botón Imprimir Factura',NULL,'boton',1,'2025-12-03 17:35:55'),(23,3,'Botón Eliminar Pieza Pintada',NULL,'boton',1,'2025-12-03 17:35:55'),(24,2,'Botón Editar Pintura',NULL,'boton',1,'2025-12-03 17:35:55'),(57,3,'Selector Cabina','Seleccionar cabina para pintar piezas','formulario',1,'2025-12-03 19:37:21'),(58,3,'Selector Pistola','Seleccionar pistola para pintar piezas','formulario',1,'2025-12-03 19:37:21'),(59,3,'Selector Horno','Seleccionar horno para curado','formulario',1,'2025-12-03 19:37:21'),(70,16,'Acceso Gestion Empleados',NULL,'acceso',1,'2025-12-05 16:47:41'),(71,16,'Formulario Nuevo Empleado',NULL,'formulario',1,'2025-12-05 16:47:41'),(72,16,'Tabla Listado Empleados',NULL,'tabla',1,'2025-12-05 16:47:41'),(73,16,'Boton Editar Empleado',NULL,'boton',1,'2025-12-05 16:47:41'),(74,16,'Boton Desactivar Empleado',NULL,'boton',1,'2025-12-05 16:47:41'),(75,16,'Boton Ver Asistencia',NULL,'boton',1,'2025-12-05 16:47:41'),(76,16,'Boton Ver Recibos',NULL,'boton',1,'2025-12-05 16:47:41'),(77,17,'Acceso Asistencia Empleado',NULL,'acceso',1,'2025-12-05 16:47:41'),(78,17,'Calendario Asistencia',NULL,'otro',1,'2025-12-05 16:47:41'),(79,17,'Boton Auto-cargar Asistencias',NULL,'boton',1,'2025-12-05 16:47:41'),(80,17,'Formulario Registrar Asistencia',NULL,'formulario',1,'2025-12-05 16:47:41'),(81,18,'Acceso Recibos Empleado',NULL,'acceso',1,'2025-12-05 16:47:41'),(82,18,'Tabla Historial Recibos',NULL,'tabla',1,'2025-12-05 16:47:41'),(83,18,'Boton Generar Recibo',NULL,'boton',1,'2025-12-05 16:47:41'),(84,18,'Boton Ver Detalle Recibo',NULL,'boton',1,'2025-12-05 16:47:41'),(85,18,'Boton Descargar PDF',NULL,'boton',1,'2025-12-05 16:47:41'),(86,19,'Acceso Gestion Recibos',NULL,'acceso',1,'2025-12-05 16:47:41'),(87,19,'Tabla Todos los Recibos',NULL,'tabla',1,'2025-12-05 16:47:41'),(88,19,'Boton Generar Recibos Masivo',NULL,'boton',1,'2025-12-05 16:47:41'),(89,19,'Boton Ver Recibo Individual',NULL,'boton',1,'2025-12-05 16:47:41'),(90,20,'Acceso Gestion Maquinarias',NULL,'acceso',1,'2025-12-05 16:47:49'),(91,20,'Tab Cabinas',NULL,'seccion',1,'2025-12-05 16:47:49'),(92,20,'Tab Pistolas',NULL,'seccion',1,'2025-12-05 16:47:49'),(93,20,'Tab Hornos',NULL,'seccion',1,'2025-12-05 16:47:49'),(94,20,'Ver Cards Cabinas',NULL,'otro',1,'2025-12-05 16:47:49'),(95,20,'Ver Cards Pistolas',NULL,'otro',1,'2025-12-05 16:47:49'),(96,20,'Ver Cards Hornos',NULL,'otro',1,'2025-12-05 16:47:49'),(97,20,'Formulario Nueva Cabina',NULL,'formulario',1,'2025-12-05 16:47:49'),(98,20,'Formulario Nueva Pistola',NULL,'formulario',1,'2025-12-05 16:47:49'),(99,20,'Formulario Nuevo Horno',NULL,'formulario',1,'2025-12-05 16:47:49'),(100,20,'Boton Editar Cabina',NULL,'boton',1,'2025-12-05 16:47:49'),(101,20,'Boton Editar Pistola',NULL,'boton',1,'2025-12-05 16:47:49'),(102,20,'Boton Editar Horno',NULL,'boton',1,'2025-12-05 16:47:49'),(103,20,'Boton Eliminar Cabina',NULL,'boton',1,'2025-12-05 16:47:49'),(104,20,'Boton Eliminar Pistola',NULL,'boton',1,'2025-12-05 16:47:49'),(105,20,'Boton Eliminar Horno',NULL,'boton',1,'2025-12-05 16:47:49'),(106,20,'Boton Registrar Mantenimiento Pistola',NULL,'boton',1,'2025-12-05 16:47:49'),(107,20,'Boton Registrar Mantenimiento Horno',NULL,'boton',1,'2025-12-05 16:47:49'),(108,21,'Acceso Reportes Maquinarias',NULL,'acceso',1,'2025-12-05 16:47:49'),(109,22,'Acceso Reporte Uso Cabinas',NULL,'acceso',1,'2025-12-05 16:47:49'),(110,23,'Acceso Reporte Productividad Diaria',NULL,'acceso',1,'2025-12-05 16:47:49'),(111,24,'Acceso Reporte Mantenimiento Pistolas',NULL,'acceso',1,'2025-12-05 16:47:49'),(112,25,'Acceso Reporte Mantenimiento Hornos',NULL,'acceso',1,'2025-12-05 16:47:49'),(113,26,'Acceso Reporte Consumo Gas',NULL,'acceso',1,'2025-12-05 16:47:49'),(115,15,'Página Principal Reportes Ventas',NULL,'acceso',1,'2025-12-06 17:44:21'),(116,28,'Acceso Participación Clientes',NULL,'acceso',1,'2025-12-06 17:44:21'),(117,29,'Acceso Pintura Más Utilizada',NULL,'acceso',1,'2025-12-06 17:44:21'),(118,30,'Acceso Ventas por Cliente',NULL,'acceso',1,'2025-12-06 17:44:21'),(119,31,'Acceso Evolución de Ventas',NULL,'acceso',1,'2025-12-06 17:44:21'),(120,32,'Acceso Consumo Pintura por Mes',NULL,'acceso',1,'2025-12-06 17:44:21'),(121,33,'Acceso Ventas Cliente Específico',NULL,'acceso',1,'2025-12-06 17:44:21'),(130,40,'Acceso Panel Base de Datos','Permite ver el panel de gestión de backups','otro',1,'2025-12-10 00:23:30'),(131,40,'Botón Nueva Política','Permite crear nuevas políticas de backup','otro',1,'2025-12-10 00:23:30'),(132,40,'Ver Tabla Políticas','Permite ver la tabla de políticas de backup','otro',1,'2025-12-10 00:23:30'),(133,40,'Botón Ejecutar Backup','Permite ejecutar backups manualmente','otro',1,'2025-12-10 00:23:30'),(134,40,'Botón Activar/Desactivar Política','Permite activar o desactivar políticas','otro',1,'2025-12-10 00:23:30'),(135,40,'Botón Eliminar Política','Permite eliminar políticas de backup','otro',1,'2025-12-10 00:23:30');
/*!40000 ALTER TABLE `componente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `formulario`
--

DROP TABLE IF EXISTS `formulario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `formulario` (
  `id_formulario` int NOT NULL AUTO_INCREMENT,
  `id_modulo` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ruta` varchar(200) NOT NULL,
  `descripcion` text,
  `icono` varchar(50) DEFAULT NULL,
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_formulario`),
  UNIQUE KEY `ruta` (`ruta`),
  KEY `id_modulo` (`id_modulo`),
  CONSTRAINT `formulario_ibfk_1` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `formulario`
--

LOCK TABLES `formulario` WRITE;
/*!40000 ALTER TABLE `formulario` DISABLE KEYS */;
INSERT INTO `formulario` VALUES (1,1,'Gestión de Piezas','/piezas',NULL,NULL,1,1,'2025-12-03 17:35:55'),(2,1,'Gestión de Pinturas','/pinturas',NULL,NULL,2,1,'2025-12-03 17:35:55'),(3,1,'Piezas Pintadas','/piezas-pintadas',NULL,NULL,3,1,'2025-12-03 17:35:55'),(4,1,'Calculadora de Consumo','/pinturas/calculadora',NULL,NULL,4,1,'2025-12-03 17:35:55'),(5,2,'Remitos','/remitos',NULL,NULL,1,1,'2025-12-03 17:35:55'),(6,2,'Facturación','/facturacion',NULL,NULL,2,1,'2025-12-03 17:35:55'),(7,2,'Clientes','/clientes',NULL,NULL,3,1,'2025-12-03 17:35:55'),(14,4,'Usuarios','/dashboard/usuarios',NULL,NULL,1,1,'2025-12-03 17:35:55'),(15,3,'Reportes Ventas Principal','/reportes/ventas',NULL,NULL,1,1,'2025-12-06 17:44:21'),(16,5,'Gestion de Empleados','/dashboard/empleados',NULL,NULL,1,1,'2025-12-05 16:47:41'),(17,5,'Asistencia Empleado','/dashboard/empleados/[id]/asistencia',NULL,NULL,2,1,'2025-12-05 16:47:41'),(18,5,'Recibos Empleado','/dashboard/empleados/[id]/recibos',NULL,NULL,3,1,'2025-12-05 16:47:41'),(19,5,'Gestion de Recibos','/dashboard/recibos',NULL,NULL,4,1,'2025-12-05 16:47:41'),(20,6,'Gestion de Maquinarias','/dashboard/maquinarias',NULL,NULL,1,1,'2025-12-05 16:47:49'),(21,6,'Reportes Maquinarias Principal','/reportes/maquinarias',NULL,NULL,2,1,'2025-12-05 16:47:49'),(22,6,'Reporte Uso Cabinas','/reportes/maquinarias/uso-cabinas',NULL,NULL,3,1,'2025-12-05 16:47:49'),(23,6,'Reporte Productividad Diaria','/reportes/maquinarias/productividad-diaria',NULL,NULL,4,1,'2025-12-05 16:47:49'),(24,6,'Reporte Mantenimiento Pistolas','/reportes/maquinarias/mantenimiento-pistolas',NULL,NULL,5,1,'2025-12-05 16:47:49'),(25,6,'Reporte Mantenimiento Hornos','/reportes/maquinarias/mantenimiento-hornos',NULL,NULL,6,1,'2025-12-05 16:47:49'),(26,6,'Reporte Consumo Gas','/reportes/maquinarias/consumo-gas',NULL,NULL,7,1,'2025-12-05 16:47:49'),(28,3,'Participación Clientes','/reportes/ventas/clientes',NULL,NULL,2,1,'2025-12-06 17:44:21'),(29,3,'Pintura Más Utilizada','/reportes/ventas/pintura-mas-utilizada',NULL,NULL,3,1,'2025-12-06 17:44:21'),(30,3,'Ventas por Cliente','/reportes/ventas/ventas-por-cliente',NULL,NULL,4,1,'2025-12-06 17:44:21'),(31,3,'Evolución de Ventas','/reportes/ventas/evolucion-ventas',NULL,NULL,5,1,'2025-12-06 17:44:21'),(32,3,'Consumo Pintura por Mes','/reportes/ventas/pintura-por-mes',NULL,NULL,6,1,'2025-12-06 17:44:21'),(33,3,'Ventas Cliente Específico','/reportes/ventas/ventas-cliente-especifico',NULL,NULL,7,1,'2025-12-06 17:44:21'),(40,7,'Panel Base de Datos','/dashboard/base-datos',NULL,'database',1,1,'2025-12-10 00:23:30');
/*!40000 ALTER TABLE `formulario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modulo`
--

DROP TABLE IF EXISTS `modulo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modulo` (
  `id_modulo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `icono` varchar(50) DEFAULT NULL,
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_modulo`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modulo`
--

LOCK TABLES `modulo` WRITE;
/*!40000 ALTER TABLE `modulo` DISABLE KEYS */;
INSERT INTO `modulo` VALUES (1,'Piezas y Pinturas','Gestión de piezas, pinturas y producción','package',1,1,'2025-12-03 17:35:55'),(2,'Facturación','Facturas, remitos y clientes','receipt',2,1,'2025-12-03 17:35:55'),(3,'Reportes','Reportes y estadísticas del sistema','chart-bar',3,1,'2025-12-03 17:35:55'),(4,'Administración','Configuración y permisos','settings',4,1,'2025-12-03 17:35:55'),(5,'Empleados y Nomina','Gestion de empleados, asistencia y recibos de sueldo','users',5,1,'2025-12-05 16:47:41'),(6,'Maquinarias','Gestion de cabinas, pistolas y hornos','settings-2',6,1,'2025-12-05 16:47:49'),(7,'Base de Datos','Gestión de backups y mantenimiento de BD','database',7,1,'2025-12-10 00:23:30');
/*!40000 ALTER TABLE `modulo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `id_estado` int DEFAULT '1',
  PRIMARY KEY (`id_grupo`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `grupo_ibfk_1` FOREIGN KEY (`id_estado`) REFERENCES `estadogrupo` (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
INSERT INTO `grupo` VALUES (1,'Admin',1),(2,'Operario Maquinarias',1),(3,'Recursos Humanos',1),(4,'Admisión y Gestión',1),(5,'Gerente',1),(6,'prueba',1);
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupocomponente`
--

DROP TABLE IF EXISTS `grupocomponente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupocomponente` (
  `id_grupo` int NOT NULL,
  `id_componente` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_grupo`,`id_componente`),
  KEY `id_componente` (`id_componente`),
  CONSTRAINT `grupocomponente_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`) ON DELETE CASCADE,
  CONSTRAINT `grupocomponente_ibfk_2` FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupocomponente`
--

LOCK TABLES `grupocomponente` WRITE;
/*!40000 ALTER TABLE `grupocomponente` DISABLE KEYS */;
INSERT INTO `grupocomponente` VALUES (1,1,'2025-12-03 17:48:25'),(1,2,'2025-12-03 17:48:25'),(1,3,'2025-12-03 17:48:25'),(1,4,'2025-12-03 17:48:25'),(1,5,'2025-12-03 17:48:25'),(1,6,'2025-12-03 17:48:25'),(1,7,'2025-12-03 17:48:25'),(1,8,'2025-12-03 17:48:25'),(1,9,'2025-12-03 17:48:25'),(1,10,'2025-12-03 17:48:25'),(1,11,'2025-12-03 17:48:25'),(1,12,'2025-12-03 17:48:25'),(1,13,'2025-12-03 17:48:25'),(1,14,'2025-12-03 17:48:25'),(1,15,'2025-12-03 17:48:25'),(1,16,'2025-12-03 17:48:25'),(1,17,'2025-12-03 17:48:25'),(1,23,'2025-12-03 17:48:25'),(1,24,'2025-12-03 17:48:25'),(1,57,'2025-12-03 19:37:21'),(1,58,'2025-12-03 19:37:21'),(1,59,'2025-12-03 19:37:21'),(1,70,'2025-12-05 16:47:41'),(1,71,'2025-12-05 16:47:41'),(1,72,'2025-12-05 16:47:41'),(1,73,'2025-12-05 16:47:41'),(1,74,'2025-12-05 16:47:41'),(1,75,'2025-12-05 16:47:41'),(1,76,'2025-12-05 16:47:41'),(1,77,'2025-12-05 16:47:41'),(1,78,'2025-12-05 16:47:41'),(1,79,'2025-12-05 16:47:41'),(1,80,'2025-12-05 16:47:41'),(1,81,'2025-12-05 16:47:41'),(1,82,'2025-12-05 16:47:41'),(1,83,'2025-12-05 16:47:41'),(1,84,'2025-12-05 16:47:41'),(1,85,'2025-12-05 16:47:41'),(1,86,'2025-12-05 16:47:41'),(1,87,'2025-12-05 16:47:41'),(1,88,'2025-12-05 16:47:41'),(1,89,'2025-12-05 16:47:41'),(1,90,'2025-12-05 16:47:49'),(1,91,'2025-12-05 16:47:49'),(1,92,'2025-12-05 16:47:49'),(1,93,'2025-12-05 16:47:49'),(1,94,'2025-12-05 16:47:49'),(1,95,'2025-12-05 16:47:49'),(1,96,'2025-12-05 16:47:49'),(1,97,'2025-12-05 16:47:49'),(1,98,'2025-12-05 16:47:49'),(1,99,'2025-12-05 16:47:49'),(1,100,'2025-12-05 16:47:49'),(1,101,'2025-12-05 16:47:49'),(1,102,'2025-12-05 16:47:49'),(1,103,'2025-12-05 16:47:49'),(1,104,'2025-12-05 16:47:49'),(1,105,'2025-12-05 16:47:49'),(1,106,'2025-12-05 16:47:49'),(1,107,'2025-12-05 16:47:49'),(1,108,'2025-12-05 16:47:49'),(1,109,'2025-12-05 16:47:49'),(1,110,'2025-12-05 16:47:49'),(1,111,'2025-12-05 16:47:49'),(1,112,'2025-12-05 16:47:49'),(1,113,'2025-12-05 16:47:49'),(1,115,'2025-12-06 17:44:21'),(1,116,'2025-12-06 17:44:21'),(1,117,'2025-12-06 17:44:21'),(1,118,'2025-12-06 17:44:21'),(1,119,'2025-12-06 17:44:21'),(1,120,'2025-12-06 17:44:21'),(1,121,'2025-12-06 17:44:21'),(1,130,'2025-12-10 00:23:30'),(1,131,'2025-12-10 00:23:30'),(1,132,'2025-12-10 00:23:30'),(1,133,'2025-12-10 00:23:30'),(1,134,'2025-12-10 00:23:30'),(1,135,'2025-12-10 00:23:30'),(2,90,'2025-12-05 18:35:07'),(2,91,'2025-12-05 18:35:07'),(2,92,'2025-12-05 18:35:07'),(2,93,'2025-12-05 18:35:07'),(2,94,'2025-12-05 18:35:07'),(2,95,'2025-12-05 18:35:07'),(2,96,'2025-12-05 18:35:07'),(2,97,'2025-12-05 18:35:07'),(2,98,'2025-12-05 18:35:07'),(2,99,'2025-12-05 18:35:07'),(2,100,'2025-12-05 18:35:07'),(2,101,'2025-12-05 18:35:07'),(2,102,'2025-12-05 18:35:07'),(2,103,'2025-12-05 18:35:07'),(2,104,'2025-12-05 18:35:07'),(2,105,'2025-12-05 18:35:07'),(2,106,'2025-12-05 18:35:07'),(2,107,'2025-12-05 18:35:07'),(2,108,'2025-12-05 18:35:07'),(2,109,'2025-12-05 18:35:07'),(2,110,'2025-12-05 18:35:07'),(2,111,'2025-12-05 18:35:07'),(2,112,'2025-12-05 18:35:07'),(2,113,'2025-12-05 18:35:07'),(3,70,'2025-12-05 18:34:46'),(3,71,'2025-12-05 18:34:46'),(3,72,'2025-12-05 18:34:46'),(3,73,'2025-12-05 18:34:46'),(3,74,'2025-12-05 18:34:46'),(3,75,'2025-12-05 18:34:46'),(3,76,'2025-12-05 18:34:46'),(3,77,'2025-12-05 18:34:46'),(3,78,'2025-12-05 18:34:46'),(3,79,'2025-12-05 18:34:46'),(3,80,'2025-12-05 18:34:46'),(3,81,'2025-12-05 18:34:46'),(3,82,'2025-12-05 18:34:46'),(3,83,'2025-12-05 18:34:46'),(3,84,'2025-12-05 18:34:46'),(3,85,'2025-12-05 18:34:46'),(3,86,'2025-12-05 18:34:46'),(3,87,'2025-12-05 18:34:46'),(3,88,'2025-12-05 18:34:46'),(3,89,'2025-12-05 18:34:46'),(4,1,'2025-12-10 00:31:50'),(4,2,'2025-12-10 00:31:50'),(4,3,'2025-12-10 00:31:50'),(4,4,'2025-12-10 00:31:50'),(4,5,'2025-12-10 00:31:50'),(4,6,'2025-12-10 00:31:50'),(4,7,'2025-12-10 00:31:50'),(4,8,'2025-12-10 00:31:50'),(4,9,'2025-12-10 00:31:50'),(4,23,'2025-12-10 00:31:50'),(4,24,'2025-12-10 00:31:50'),(4,57,'2025-12-10 00:31:50'),(4,58,'2025-12-10 00:31:50'),(4,59,'2025-12-10 00:31:50'),(5,108,'2025-12-06 18:02:02'),(5,109,'2025-12-06 18:02:02'),(5,110,'2025-12-06 18:02:02'),(5,111,'2025-12-06 18:02:02'),(5,112,'2025-12-06 18:02:02'),(5,115,'2025-12-06 18:02:02'),(5,117,'2025-12-06 18:02:02'),(5,118,'2025-12-06 18:02:02'),(5,119,'2025-12-06 18:02:02'),(5,120,'2025-12-06 18:02:02'),(5,121,'2025-12-06 18:02:02');
/*!40000 ALTER TABLE `grupocomponente` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-09 23:56:25
