-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: electrotech2
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'c84a8f7f-b50d-11f0-8cc3-08bfb8e2efa8:1-1350';

--
-- Table structure for table `accion`
--

DROP TABLE IF EXISTS `accion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accion` (
  `id_accion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_accion`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accion`
--

LOCK TABLES `accion` WRITE;
/*!40000 ALTER TABLE `accion` DISABLE KEYS */;
/*!40000 ALTER TABLE `accion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alertasmaquinaria`
--

DROP TABLE IF EXISTS `alertasmaquinaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertasmaquinaria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_maquinaria` int NOT NULL,
  `fecha` datetime NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_maquinaria` (`id_maquinaria`),
  CONSTRAINT `alertasmaquinaria_ibfk_1` FOREIGN KEY (`id_maquinaria`) REFERENCES `maquinaria` (`id_maquinaria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertasmaquinaria`
--

LOCK TABLES `alertasmaquinaria` WRITE;
/*!40000 ALTER TABLE `alertasmaquinaria` DISABLE KEYS */;
/*!40000 ALTER TABLE `alertasmaquinaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencia`
--

DROP TABLE IF EXISTS `asistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencia` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `fecha` date NOT NULL,
  `presente` tinyint(1) NOT NULL DEFAULT '1',
  `es_sabado` tinyint(1) NOT NULL DEFAULT '0',
  `horas_extra` decimal(4,2) DEFAULT '0.00',
  `justificada` tinyint(1) DEFAULT NULL COMMENT 'NULL si presente=1, TRUE/FALSE si presente=0',
  `motivo` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uk_empleado_fecha` (`id_empleado`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_empleado` (`id_empleado`),
  CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=250 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia`
--

LOCK TABLES `asistencia` WRITE;
/*!40000 ALTER TABLE `asistencia` DISABLE KEYS */;
INSERT INTO `asistencia` VALUES (83,4,'2025-12-01',1,0,0.00,NULL,NULL,'2025-12-05 17:49:17','2025-12-05 17:49:17'),(84,4,'2025-12-02',1,0,0.00,NULL,NULL,'2025-12-05 17:49:17','2025-12-05 17:49:17'),(85,4,'2025-12-03',1,0,0.00,NULL,NULL,'2025-12-05 17:49:17','2025-12-05 17:49:17'),(168,1,'2025-11-03',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(169,1,'2025-11-04',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(170,1,'2025-11-05',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(171,1,'2025-11-06',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(172,1,'2025-11-07',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(173,1,'2025-11-10',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(174,1,'2025-11-11',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(175,1,'2025-11-12',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(176,1,'2025-11-13',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(177,1,'2025-11-14',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(178,1,'2025-11-17',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(179,1,'2025-11-18',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(180,1,'2025-11-19',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(181,1,'2025-11-20',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(182,1,'2025-11-21',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(183,1,'2025-11-24',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(184,1,'2025-11-25',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(185,1,'2025-11-26',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(186,1,'2025-11-27',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(187,1,'2025-11-28',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(188,3,'2025-11-03',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(189,3,'2025-11-04',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(190,3,'2025-11-05',0,0,0.00,0,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(191,3,'2025-11-06',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(192,3,'2025-11-07',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(193,3,'2025-11-10',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(194,3,'2025-11-11',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(195,3,'2025-11-12',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(196,3,'2025-11-13',0,0,0.00,0,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(197,3,'2025-11-14',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(198,3,'2025-11-17',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(199,3,'2025-11-18',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(200,3,'2025-11-19',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(201,3,'2025-11-20',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(202,3,'2025-11-21',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(203,3,'2025-11-24',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(204,3,'2025-11-25',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(205,3,'2025-11-26',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(206,3,'2025-11-27',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(207,3,'2025-11-28',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(208,4,'2025-11-03',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(209,4,'2025-11-04',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(210,4,'2025-11-05',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(211,4,'2025-11-06',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(212,4,'2025-11-07',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(213,4,'2025-11-10',0,0,0.00,1,'Turno médico programado','2025-12-05 17:55:52','2025-12-05 17:55:52'),(214,4,'2025-11-11',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(215,4,'2025-11-12',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(216,4,'2025-11-13',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(217,4,'2025-11-14',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(218,4,'2025-11-17',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(219,4,'2025-11-18',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(220,4,'2025-11-19',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(221,4,'2025-11-20',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(222,4,'2025-11-21',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(223,4,'2025-11-24',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(224,4,'2025-11-25',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(225,4,'2025-11-26',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(226,4,'2025-11-27',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(227,4,'2025-11-28',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(228,5,'2025-11-03',1,0,2.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(229,5,'2025-11-04',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(230,5,'2025-11-05',1,0,3.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(231,5,'2025-11-06',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(232,5,'2025-11-07',1,0,2.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(233,5,'2025-11-08',1,1,4.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(234,5,'2025-11-10',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(235,5,'2025-11-11',1,0,2.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(236,5,'2025-11-12',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(237,5,'2025-11-13',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(238,5,'2025-11-14',1,0,1.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(239,5,'2025-11-15',1,1,5.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(240,5,'2025-11-17',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(241,5,'2025-11-18',1,0,2.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(242,5,'2025-11-19',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(243,5,'2025-11-20',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(244,5,'2025-11-21',1,0,1.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(245,5,'2025-11-24',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(246,5,'2025-11-25',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(247,5,'2025-11-26',1,0,2.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(248,5,'2025-11-27',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52'),(249,5,'2025-11-28',1,0,0.00,NULL,NULL,'2025-12-05 17:55:52','2025-12-05 17:55:52');
/*!40000 ALTER TABLE `asistencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoriasesion`
--

DROP TABLE IF EXISTS `auditoriasesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoriasesion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_hora_login` datetime NOT NULL,
  `fecha_hora_logout` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `auditoriasesion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoriasesion`
--

LOCK TABLES `auditoriasesion` WRITE;
/*!40000 ALTER TABLE `auditoriasesion` DISABLE KEYS */;
INSERT INTO `auditoriasesion` VALUES (1,1,'2025-12-04 15:36:41','2025-12-04 15:41:59'),(2,1,'2025-12-04 15:42:07','2025-12-04 15:44:40'),(3,1,'2025-12-04 16:15:12',NULL),(4,1,'2025-12-04 16:19:11',NULL),(5,1,'2025-12-04 16:43:55',NULL),(6,1,'2025-12-04 16:49:01',NULL),(7,1,'2025-12-04 16:53:27',NULL),(8,1,'2025-12-04 16:56:20',NULL),(9,1,'2025-12-04 19:13:21','2025-12-04 19:38:32'),(10,1,'2025-12-04 19:39:01','2025-12-04 19:43:12'),(11,2,'2025-12-04 19:43:16','2025-12-04 19:43:31'),(12,2,'2025-12-04 19:43:38','2025-12-04 19:44:21'),(13,1,'2025-12-04 19:44:27','2025-12-04 19:47:56'),(14,2,'2025-12-04 19:48:10',NULL),(15,2,'2025-12-04 19:48:21','2025-12-04 19:48:51'),(16,1,'2025-12-04 19:48:58','2025-12-04 19:49:44'),(17,2,'2025-12-04 19:49:53','2025-12-04 19:50:08'),(18,1,'2025-12-04 19:50:14','2025-12-04 19:50:31'),(19,2,'2025-12-04 19:50:36','2025-12-04 19:53:21'),(20,1,'2025-12-04 19:53:26',NULL),(21,1,'2025-12-04 19:54:36',NULL),(22,1,'2025-12-04 19:56:34','2025-12-04 20:00:09'),(23,2,'2025-12-04 20:00:16','2025-12-04 20:00:34'),(24,1,'2025-12-04 20:00:40',NULL),(25,1,'2025-12-04 20:13:46',NULL),(26,1,'2025-12-04 20:38:55',NULL),(27,1,'2025-12-05 11:23:40','2025-12-05 11:35:27'),(28,1,'2025-12-05 11:35:32','2025-12-05 11:35:43'),(29,1,'2025-12-05 11:36:04',NULL),(30,1,'2025-12-05 11:43:51',NULL),(31,1,'2025-12-05 13:53:54','2025-12-05 13:54:13'),(32,1,'2025-12-05 14:01:25','2025-12-05 14:04:54'),(33,1,'2025-12-05 14:05:19',NULL),(34,1,'2025-12-05 14:31:29','2025-12-05 14:33:35'),(35,2,'2025-12-05 14:33:39','2025-12-05 14:34:24'),(36,1,'2025-12-05 14:34:29','2025-12-05 14:35:07'),(37,2,'2025-12-05 14:35:16','2025-12-05 14:35:46'),(38,1,'2025-12-05 14:36:01','2025-12-05 14:43:05'),(39,2,'2025-12-05 14:43:10','2025-12-05 14:46:35'),(40,1,'2025-12-05 14:48:54','2025-12-05 16:35:54'),(41,1,'2025-12-06 10:55:22',NULL),(42,1,'2025-12-06 11:05:43',NULL),(43,1,'2025-12-06 11:12:36',NULL),(44,1,'2025-12-06 23:13:54','2025-12-06 23:33:44'),(45,1,'2025-12-07 17:18:32','2025-12-07 17:19:25'),(46,1,'2025-12-08 18:04:48','2025-12-08 18:08:29'),(47,1,'2025-12-08 18:09:25','2025-12-08 18:10:10'),(48,1,'2025-12-08 18:13:18','2025-12-08 18:13:43'),(49,1,'2025-12-08 18:20:22',NULL),(50,1,'2025-12-08 18:22:32',NULL),(51,1,'2025-12-08 18:25:01',NULL),(52,1,'2025-12-08 18:27:17','2025-12-08 18:27:31'),(53,1,'2025-12-08 19:20:44','2025-12-08 19:20:57'),(54,1,'2025-12-08 19:31:16','2025-12-08 19:31:38'),(55,1,'2025-12-08 19:32:24','2025-12-08 19:40:54'),(56,1,'2025-12-09 10:33:08',NULL),(57,1,'2025-12-09 10:57:30',NULL);
/*!40000 ALTER TABLE `auditoriasesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabina`
--

DROP TABLE IF EXISTS `cabina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabina` (
  `id_cabina` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `max_piezas_diarias` int DEFAULT '0',
  `piezas_hoy` int DEFAULT '0',
  `estado` varchar(50) DEFAULT 'activa',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cabina`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabina`
--

LOCK TABLES `cabina` WRITE;
/*!40000 ALTER TABLE `cabina` DISABLE KEYS */;
INSERT INTO `cabina` VALUES (1,'Cabina Principal A','Cabina de pintura automática principal',200,0,'activa','2025-12-04 17:26:09'),(2,'Cabina Secundaria B','Cabina de pintura secundaria',150,0,'activa','2025-12-04 17:26:09'),(3,'Cabina Especial C','Cabina para piezas especiales y grandes',100,0,'activa','2025-12-04 17:26:09'),(4,'Cabina Manual D','Cabina de pintura manual para detalles',80,0,'activa','2025-12-04 17:26:09');
/*!40000 ALTER TABLE `cabina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinahistorial`
--

DROP TABLE IF EXISTS `cabinahistorial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabinahistorial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_cabina` int NOT NULL,
  `fecha` date NOT NULL,
  `piezas_pintadas` int NOT NULL,
  `id_pieza` int DEFAULT NULL,
  `id_pintura` int DEFAULT NULL,
  `horas_trabajo` decimal(7,2) DEFAULT '0.00',
  `gas_consumido` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinahistorial`
--

LOCK TABLES `cabinahistorial` WRITE;
/*!40000 ALTER TABLE `cabinahistorial` DISABLE KEYS */;
INSERT INTO `cabinahistorial` VALUES (1,1,'2025-11-05',50,1,1,5.00,12.50,'2025-12-04 17:26:09'),(2,1,'2025-11-06',80,2,3,8.00,20.00,'2025-12-04 17:26:09'),(3,2,'2025-11-08',70,5,4,7.00,17.50,'2025-12-04 17:26:09'),(4,3,'2025-11-10',50,8,6,5.00,15.00,'2025-12-04 17:26:09'),(5,1,'2025-11-13',120,11,1,12.00,30.00,'2025-12-04 17:26:09'),(6,1,'2025-12-04',11,8,14,1.10,2.75,'2025-12-04 23:39:23'),(7,3,'2025-12-04',11,10,15,1.10,3.30,'2025-12-04 23:40:50'),(8,3,'2025-12-04',12,13,16,1.20,3.60,'2025-12-04 23:42:11'),(9,3,'2025-12-04',32,9,17,3.20,9.60,'2025-12-04 23:45:24'),(10,2,'2025-12-05',1,12,16,0.10,0.25,'2025-12-05 14:24:04'),(11,2,'2025-12-05',18,12,17,1.80,4.50,'2025-12-05 14:30:34'),(12,3,'2025-12-05',1,12,19,0.10,0.30,'2025-12-05 14:36:20');
/*!40000 ALTER TABLE `cabinahistorial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinahorno`
--

DROP TABLE IF EXISTS `cabinahorno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabinahorno` (
  `id_cabina` int NOT NULL,
  `id_horno` int NOT NULL,
  `fecha_asignacion` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_cabina`,`id_horno`),
  KEY `fk_ch_horno` (`id_horno`),
  CONSTRAINT `cabinahorno_fk_cabina` FOREIGN KEY (`id_cabina`) REFERENCES `cabina` (`id_cabina`) ON DELETE CASCADE,
  CONSTRAINT `cabinahorno_fk_horno` FOREIGN KEY (`id_horno`) REFERENCES `horno` (`id_horno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinahorno`
--

LOCK TABLES `cabinahorno` WRITE;
/*!40000 ALTER TABLE `cabinahorno` DISABLE KEYS */;
INSERT INTO `cabinahorno` VALUES (1,1,'2025-01-01',1),(1,2,'2025-01-01',1),(2,2,'2025-01-01',1),(3,3,'2025-01-01',1),(4,4,'2025-01-01',1);
/*!40000 ALTER TABLE `cabinahorno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cabinapistola`
--

DROP TABLE IF EXISTS `cabinapistola`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabinapistola` (
  `id_cabina` int NOT NULL,
  `id_pistola` int NOT NULL,
  `fecha_asignacion` date DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_cabina`,`id_pistola`),
  KEY `fk_cp_pistola` (`id_pistola`),
  CONSTRAINT `cabinapistola_fk_cabina` FOREIGN KEY (`id_cabina`) REFERENCES `cabina` (`id_cabina`) ON DELETE CASCADE,
  CONSTRAINT `cabinapistola_fk_pistola` FOREIGN KEY (`id_pistola`) REFERENCES `pistola` (`id_pistola`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinapistola`
--

LOCK TABLES `cabinapistola` WRITE;
/*!40000 ALTER TABLE `cabinapistola` DISABLE KEYS */;
INSERT INTO `cabinapistola` VALUES (1,1,'2025-01-01',1),(1,2,'2025-01-01',1),(2,3,'2025-01-01',1),(2,4,'2025-03-01',1),(3,5,'2025-01-01',1),(4,3,'2025-06-01',0);
/*!40000 ALTER TABLE `cabinapistola` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'AutoParts SA','Av. Industrial 1234, Buenos Aires'),(2,'Metalúrgica del Sur','Calle 50 N° 890, La Plata'),(3,'Industrias del Norte','Ruta 9 Km 45, Rosario'),(4,'Fábrica Central','Av. Libertador 2500, Córdoba'),(5,'Componentes Tech','Parque Industrial Zona 3, Mendoza');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `color`
--

DROP TABLE IF EXISTS `color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `color` (
  `id_color` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_color`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `color`
--

LOCK TABLES `color` WRITE;
/*!40000 ALTER TABLE `color` DISABLE KEYS */;
INSERT INTO `color` VALUES (1,'Negro'),(2,'Blanco'),(3,'Gris'),(4,'Azul'),(5,'Rojo'),(6,'Verde'),(7,'Amarillo'),(8,'Naranja'),(9,'Plateado'),(10,'Beige');
/*!40000 ALTER TABLE `color` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `componente` VALUES (1,1,'Formulario Nueva Pieza',NULL,'formulario',1,'2025-12-04 17:20:18'),(2,1,'Tabla Listado Piezas',NULL,'tabla',1,'2025-12-04 17:20:18'),(3,1,'Botón Editar Pieza',NULL,'boton',1,'2025-12-04 17:20:18'),(4,1,'Botón Eliminar Pieza',NULL,'boton',1,'2025-12-04 17:20:18'),(5,2,'Formulario Nueva Pintura',NULL,'formulario',1,'2025-12-04 17:20:18'),(6,2,'Tabla Listado Pinturas',NULL,'tabla',1,'2025-12-04 17:20:18'),(7,2,'Botón Eliminar Pintura',NULL,'boton',1,'2025-12-04 17:20:18'),(8,3,'Formulario Registrar Producción',NULL,'formulario',1,'2025-12-04 17:20:18'),(9,3,'Tabla Historial Producción',NULL,'tabla',1,'2025-12-04 17:20:18'),(10,5,'Formulario Cargar Remito',NULL,'formulario',1,'2025-12-04 17:20:18'),(11,5,'Tabla Listado Remitos',NULL,'tabla',1,'2025-12-04 17:20:18'),(12,5,'Botón Ver Detalle',NULL,'boton',1,'2025-12-04 17:20:18'),(13,5,'Botón Imprimir PDF',NULL,'boton',1,'2025-12-04 17:20:18'),(14,6,'Formulario Generar Factura',NULL,'formulario',1,'2025-12-04 17:20:18'),(15,6,'Tabla Listado Facturas',NULL,'tabla',1,'2025-12-04 17:20:18'),(16,6,'Botón Ver Detalle Factura',NULL,'boton',1,'2025-12-04 17:20:18'),(17,6,'Botón Imprimir Factura',NULL,'boton',1,'2025-12-04 17:20:18'),(18,8,'Acceso Participación Clientes',NULL,'acceso',1,'2025-12-04 17:20:18'),(19,9,'Acceso Pintura Más Utilizada',NULL,'acceso',1,'2025-12-04 17:20:18'),(20,10,'Acceso Ventas por Cliente',NULL,'acceso',1,'2025-12-04 17:20:18'),(21,11,'Acceso Evolución de Ventas',NULL,'acceso',1,'2025-12-04 17:20:18'),(22,12,'Acceso Consumo Pintura por Mes',NULL,'acceso',1,'2025-12-04 17:20:18'),(23,3,'Botón Eliminar Pieza Pintada',NULL,'boton',1,'2025-12-04 17:20:18'),(24,2,'Botón Editar Pintura',NULL,'boton',1,'2025-12-04 17:20:18'),(27,13,'Acceso Ventas Cliente Específico',NULL,'acceso',1,'2025-12-04 17:20:18'),(29,15,'Página Principal Reportes',NULL,'otro',1,'2025-12-04 17:20:18'),(30,16,'Tab Cabinas',NULL,'otro',1,'2025-12-04 19:25:24'),(31,16,'Ver Cards Cabinas',NULL,'otro',1,'2025-12-04 19:25:24'),(32,16,'Formulario Nueva Cabina',NULL,'formulario',1,'2025-12-04 19:25:24'),(33,16,'Botón Editar Cabina',NULL,'boton',1,'2025-12-04 19:25:24'),(34,16,'Botón Eliminar Cabina',NULL,'boton',1,'2025-12-04 19:25:24'),(35,16,'Tab Pistolas',NULL,'otro',1,'2025-12-04 19:25:24'),(36,16,'Ver Cards Pistolas',NULL,'otro',1,'2025-12-04 19:25:24'),(37,16,'Formulario Nueva Pistola',NULL,'formulario',1,'2025-12-04 19:25:24'),(38,16,'Botón Editar Pistola',NULL,'boton',1,'2025-12-04 19:25:24'),(39,16,'Botón Eliminar Pistola',NULL,'boton',1,'2025-12-04 19:25:24'),(40,16,'Botón Registrar Mantenimiento Pistola',NULL,'boton',1,'2025-12-04 19:25:24'),(41,16,'Tab Hornos',NULL,'otro',1,'2025-12-04 19:25:24'),(42,16,'Ver Cards Hornos',NULL,'otro',1,'2025-12-04 19:25:24'),(43,16,'Formulario Nuevo Horno',NULL,'formulario',1,'2025-12-04 19:25:24'),(44,16,'Botón Editar Horno',NULL,'boton',1,'2025-12-04 19:25:24'),(45,16,'Botón Eliminar Horno',NULL,'boton',1,'2025-12-04 19:25:24'),(46,16,'Botón Registrar Mantenimiento Horno',NULL,'boton',1,'2025-12-04 19:25:24'),(47,17,'Submenu Maquinarias',NULL,'otro',1,'2025-12-04 19:32:27'),(48,20,'Acceso - Uso Cabinas',NULL,'acceso',1,'2025-12-04 19:32:27'),(49,21,'Acceso - Productividad Diaria',NULL,'acceso',1,'2025-12-04 19:32:27'),(50,22,'Acceso - Mantenimiento Pistolas',NULL,'acceso',1,'2025-12-04 19:32:27'),(51,23,'Acceso - Mantenimiento Hornos',NULL,'acceso',1,'2025-12-04 19:32:27'),(52,24,'Acceso - Consumo Gas',NULL,'acceso',1,'2025-12-04 19:32:27'),(70,16,'Acceso Gestión Empleados',NULL,'acceso',1,'2025-12-09 13:45:08'),(71,25,'Formulario Nuevo Empleado','Formulario para crear nuevos empleados','formulario',1,'2025-12-05 17:29:31'),(72,25,'Tabla Listado Empleados','Tabla con el listado de empleados','tabla',1,'2025-12-05 17:29:31'),(73,25,'Botón Editar Empleado','Botón para editar datos del empleado','boton',1,'2025-12-05 17:29:31'),(74,25,'Botón Desactivar Empleado','Botón para desactivar o reactivar empleado','boton',1,'2025-12-05 17:29:31'),(75,25,'Botón Ver Asistencia','Botón para acceder a la asistencia del empleado','boton',1,'2025-12-05 17:29:31'),(76,25,'Botón Ver Recibos','Botón para acceder a los recibos del empleado','boton',1,'2025-12-05 17:29:31'),(77,26,'Acceso Asistencia Empleado','Acceso a la página de asistencia','acceso',1,'2025-12-05 17:29:31'),(78,26,'Calendario Asistencia','Vista del calendario de asistencias','otro',1,'2025-12-05 17:29:31'),(79,26,'Botón Auto-cargar Asistencias','Botón para cargar asistencias automáticamente','boton',1,'2025-12-05 17:29:31'),(80,26,'Formulario Registrar Asistencia','Botón para guardar registro de asistencia','formulario',1,'2025-12-05 17:29:31'),(81,27,'Acceso Recibos Empleado','Acceso a la página de recibos','acceso',1,'2025-12-05 17:29:31'),(82,27,'Tabla Historial Recibos','Tabla con historial de recibos generados','tabla',1,'2025-12-05 17:29:31'),(83,27,'Botón Generar Recibo','Botón para generar un nuevo recibo de sueldo','boton',1,'2025-12-05 17:29:31'),(84,27,'Botón Ver Detalle Recibo','Botón para ver el detalle del recibo','boton',1,'2025-12-05 17:29:31'),(85,27,'Botón Descargar PDF','Botón para descargar recibo en PDF','boton',1,'2025-12-05 17:29:31'),(86,19,'Acceso Gestión Recibos',NULL,'acceso',1,'2025-12-09 13:45:08'),(87,19,'Tabla Todos los Recibos',NULL,'tabla',1,'2025-12-09 13:45:08'),(88,19,'Botón Generar Recibos Masivo',NULL,'boton',1,'2025-12-09 13:45:08'),(89,19,'Botón Ver Recibo Individual',NULL,'boton',1,'2025-12-09 13:45:08'),(90,20,'Acceso Gestión Maquinarias',NULL,'acceso',1,'2025-12-09 13:45:08'),(91,20,'Tab Cabinas',NULL,'seccion',1,'2025-12-09 13:45:08'),(92,20,'Tab Pistolas',NULL,'seccion',1,'2025-12-09 13:45:08'),(93,20,'Tab Hornos',NULL,'seccion',1,'2025-12-09 13:45:08'),(94,20,'Ver Cards Cabinas',NULL,'otro',1,'2025-12-09 13:45:08'),(95,20,'Ver Cards Pistolas',NULL,'otro',1,'2025-12-09 13:45:08'),(96,20,'Ver Cards Hornos',NULL,'otro',1,'2025-12-09 13:45:08'),(97,20,'Formulario Nueva Cabina',NULL,'formulario',1,'2025-12-09 13:45:08'),(98,20,'Formulario Nueva Pistola',NULL,'formulario',1,'2025-12-09 13:45:08'),(99,20,'Formulario Nuevo Horno',NULL,'formulario',1,'2025-12-09 13:45:08'),(100,20,'Botón Editar Cabina',NULL,'boton',1,'2025-12-09 13:45:08'),(101,20,'Botón Editar Pistola',NULL,'boton',1,'2025-12-09 13:45:08'),(102,20,'Botón Editar Horno',NULL,'boton',1,'2025-12-09 13:45:08'),(103,20,'Botón Eliminar Cabina',NULL,'boton',1,'2025-12-09 13:45:08'),(104,20,'Botón Eliminar Pistola',NULL,'boton',1,'2025-12-09 13:45:08'),(105,20,'Botón Eliminar Horno',NULL,'boton',1,'2025-12-09 13:45:08'),(106,20,'Botón Registrar Mantenimiento Pistola',NULL,'boton',1,'2025-12-09 13:45:08'),(107,20,'Botón Registrar Mantenimiento Horno',NULL,'boton',1,'2025-12-09 13:45:08'),(108,21,'Acceso Reportes Maquinarias',NULL,'acceso',1,'2025-12-09 13:45:08'),(109,22,'Acceso Reporte Uso Cabinas',NULL,'acceso',1,'2025-12-09 13:45:08'),(110,23,'Acceso Reporte Productividad Diaria',NULL,'acceso',1,'2025-12-09 13:45:08'),(111,24,'Acceso Reporte Mantenimiento Pistolas',NULL,'acceso',1,'2025-12-09 13:45:08'),(112,25,'Acceso Reporte Mantenimiento Hornos',NULL,'acceso',1,'2025-12-09 13:45:08'),(113,26,'Acceso Reporte Consumo Gas',NULL,'acceso',1,'2025-12-09 13:45:08'),(115,15,'Página Principal Reportes Ventas',NULL,'acceso',1,'2025-12-09 13:45:08'),(116,28,'Acceso Participación Clientes',NULL,'acceso',1,'2025-12-09 13:45:08'),(117,29,'Acceso Pintura Más Utilizada',NULL,'acceso',1,'2025-12-09 13:45:08'),(118,30,'Acceso Ventas por Cliente',NULL,'acceso',1,'2025-12-09 13:45:08'),(119,31,'Acceso Evolución de Ventas',NULL,'acceso',1,'2025-12-09 13:45:08'),(120,32,'Acceso Consumo Pintura por Mes',NULL,'acceso',1,'2025-12-09 13:45:08'),(121,33,'Acceso Ventas Cliente Específico',NULL,'acceso',1,'2025-12-09 13:45:08'),(130,40,'Acceso Panel Base de Datos','Permite ver el panel de gestión de backups','otro',1,'2025-12-09 13:56:52'),(131,40,'Botón Nueva Política','Permite crear nuevas políticas de backup','otro',1,'2025-12-09 13:56:52'),(132,40,'Ver Tabla Políticas','Permite ver la tabla de políticas de backup','otro',1,'2025-12-09 13:56:52'),(133,40,'Botón Ejecutar Backup','Permite ejecutar backups manualmente','otro',1,'2025-12-09 13:56:52'),(134,40,'Botón Activar/Desactivar Política','Permite activar o desactivar políticas','otro',1,'2025-12-09 13:56:52'),(135,40,'Botón Eliminar Política','Permite eliminar políticas de backup','otro',1,'2025-12-09 13:56:52');
/*!40000 ALTER TABLE `componente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `config_nomina`
--

DROP TABLE IF EXISTS `config_nomina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config_nomina` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` varchar(100) NOT NULL,
  `descripcion` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config_nomina`
--

LOCK TABLES `config_nomina` WRITE;
/*!40000 ALTER TABLE `config_nomina` DISABLE KEYS */;
INSERT INTO `config_nomina` VALUES (1,'porcentaje_presentismo','9','Porcentaje de presentismo sobre salario base','2025-12-05 16:58:19'),(2,'max_faltas_justificadas_presentismo','3','Máximo de faltas justificadas para mantener presentismo','2025-12-05 16:58:19'),(3,'porcentaje_hora_extra_sabado','50','Porcentaje adicional por hora extra en sábado','2025-12-05 16:58:19'),(4,'valor_hora_extra_base','1.5','Multiplicador del valor hora para horas extra normales','2025-12-05 16:58:19');
/*!40000 ALTER TABLE `config_nomina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleado`
--

DROP TABLE IF EXISTS `empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleado` (
  `id_empleado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `funcion` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `dni` varchar(15) DEFAULT NULL,
  `direccion` text,
  `salario_base` decimal(10,2) DEFAULT '0.00',
  `fecha_ingreso` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empleado`),
  UNIQUE KEY `uk_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado`
--

LOCK TABLES `empleado` WRITE;
/*!40000 ALTER TABLE `empleado` DISABLE KEYS */;
INSERT INTO `empleado` VALUES (1,'Juan','Pérez','Operario de Pintura','11-2345-6789','30123456','Av. Corrientes 1234, CABA',450000.00,'2020-03-15',1,'2025-12-05 16:58:18'),(2,'María','González','Supervisora de Calidad','11-3456-7890','28765432','Calle Rivadavia 567, CABA',580000.00,'2018-06-01',0,'2025-12-05 16:58:18'),(3,'Carlos','Rodríguez','Técnico de Maquinaria','11-4567-8901','32456789','San Martín 890, Avellaneda',520000.00,'2021-01-10',1,'2025-12-05 16:58:18'),(4,'Ana','Martínez','Operaria de Pintura','11-5678-9012','33789012','Belgrano 456, Lanús',430000.00,'2022-04-20',1,'2025-12-05 16:58:18'),(5,'Luis','Fernández','Jefe de Producción','11-6789-0123','27345678','Mitre 789, Quilmes',720000.00,'2015-08-12',1,'2025-12-05 16:58:18');
/*!40000 ALTER TABLE `empleado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadogrupo`
--

DROP TABLE IF EXISTS `estadogrupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadogrupo` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadogrupo`
--

LOCK TABLES `estadogrupo` WRITE;
/*!40000 ALTER TABLE `estadogrupo` DISABLE KEYS */;
INSERT INTO `estadogrupo` VALUES (1,'Activo'),(2,'Inactivo'),(3,'Suspendido');
/*!40000 ALTER TABLE `estadogrupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura` (
  `id_factura` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura`
--

LOCK TABLES `factura` WRITE;
/*!40000 ALTER TABLE `factura` DISABLE KEYS */;
INSERT INTO `factura` VALUES (1,1,'2025-09-20 14:00:00',130000.00),(2,2,'2025-09-25 15:30:00',210000.00),(3,3,'2025-09-28 16:00:00',142000.00),(4,4,'2025-10-10 10:00:00',110000.00),(5,5,'2025-10-15 11:30:00',95000.00),(6,1,'2025-10-22 14:30:00',126000.00),(7,2,'2025-10-28 15:00:00',175000.00),(8,1,'2025-11-08 14:00:00',155000.00),(9,3,'2025-11-12 16:00:00',180000.00),(10,4,'2025-11-16 10:00:00',132000.00),(11,2,'2025-11-20 15:30:00',245000.00),(12,5,'2025-11-22 11:30:00',100000.00),(13,1,'2025-11-27 14:30:00',115000.00),(14,3,'2025-11-29 16:30:00',145000.00);
/*!40000 ALTER TABLE `factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturadetalle`
--

DROP TABLE IF EXISTS `facturadetalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturadetalle` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_factura` int NOT NULL,
  `id_pieza_pintada` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_factura` (`id_factura`),
  KEY `id_pieza_pintada` (`id_pieza_pintada`),
  CONSTRAINT `facturadetalle_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`),
  CONSTRAINT `facturadetalle_ibfk_2` FOREIGN KEY (`id_pieza_pintada`) REFERENCES `piezapintada` (`id_pieza_pintada`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturadetalle`
--

LOCK TABLES `facturadetalle` WRITE;
/*!40000 ALTER TABLE `facturadetalle` DISABLE KEYS */;
INSERT INTO `facturadetalle` VALUES (1,1,1,40,850.00),(2,1,2,35,1200.00),(3,1,3,35,1200.00),(4,1,4,40,1500.00),(5,2,5,30,2800.00),(6,2,6,30,2800.00),(7,2,7,30,3500.00),(8,3,8,40,950.00),(9,3,9,30,1600.00),(10,3,10,30,1800.00),(11,4,11,50,700.00),(12,4,12,50,700.00),(13,4,13,25,1800.00),(14,5,14,35,1100.00),(15,5,15,35,1600.00),(16,6,16,35,850.00),(17,6,17,35,1200.00),(18,6,18,35,1200.00),(19,6,19,35,1500.00),(20,7,20,25,2800.00),(21,7,21,25,2800.00),(22,7,22,25,3500.00),(23,8,23,50,850.00),(24,8,24,40,1200.00),(25,8,25,40,1200.00),(26,8,26,45,1500.00),(27,9,27,50,950.00),(28,9,28,40,1600.00),(29,9,29,35,1800.00),(30,10,30,60,700.00),(31,10,31,60,700.00),(32,10,32,30,1800.00),(33,11,33,35,2800.00),(34,11,34,35,2800.00),(35,11,35,30,3500.00),(36,12,36,40,1100.00),(37,12,37,35,1600.00),(38,13,38,35,850.00),(39,13,39,30,1200.00),(40,13,40,30,1200.00),(41,13,41,35,1500.00),(42,14,42,40,950.00),(43,14,43,30,1600.00),(44,14,44,25,1800.00);
/*!40000 ALTER TABLE `facturadetalle` ENABLE KEYS */;
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
INSERT INTO `formulario` VALUES (1,1,'Gestión de Piezas','/piezas',NULL,NULL,1,1,'2025-12-04 17:20:18'),(2,1,'Gestión de Pinturas','/pinturas',NULL,NULL,2,1,'2025-12-04 17:20:18'),(3,1,'Piezas Pintadas','/piezas-pintadas',NULL,NULL,3,1,'2025-12-04 17:20:18'),(4,1,'Calculadora de Consumo','/pinturas/calculadora',NULL,NULL,4,1,'2025-12-04 17:20:18'),(5,2,'Remitos','/remitos',NULL,NULL,1,1,'2025-12-04 17:20:18'),(6,2,'Facturación','/facturacion',NULL,NULL,2,1,'2025-12-04 17:20:18'),(7,2,'Clientes','/clientes',NULL,NULL,3,1,'2025-12-04 17:20:18'),(8,3,'Participación Clientes','/reportes/clientes',NULL,NULL,1,1,'2025-12-04 17:20:18'),(9,3,'Pintura Más Utilizada','/reportes/pintura-mas-utilizada',NULL,NULL,2,1,'2025-12-04 17:20:18'),(10,3,'Ventas por Cliente','/reportes/ventas-por-cliente',NULL,NULL,3,1,'2025-12-04 17:20:18'),(11,3,'Evolución de Ventas','/reportes/evolucion-ventas',NULL,NULL,4,1,'2025-12-04 17:20:18'),(12,3,'Consumo Pintura por Mes','/reportes/pintura-por-mes',NULL,NULL,5,1,'2025-12-04 17:20:18'),(13,3,'Ventas Cliente Específico','/reportes/ventas-cliente-especifico',NULL,NULL,6,1,'2025-12-04 17:20:18'),(14,4,'Usuarios','/dashboard/usuarios',NULL,NULL,1,1,'2025-12-04 17:20:18'),(15,3,'Reportes Ventas Principal','/reportes/ventas',NULL,NULL,0,1,'2025-12-04 17:20:18'),(16,5,'Gestión de Maquinaria','/dashboard/maquinarias','Gestión de maquinaria','cog',0,1,'2025-12-04 19:25:24'),(17,5,'Reportes Maquinarias','/reportes/maquinarias','Reportes y estadísticas de maquinaria','chart-bar',0,1,'2025-12-04 19:32:27'),(20,5,'Uso Cabinas','/reportes/maquinarias/uso-cabinas','Reporte: uso de cabinas','chart-bar',1,1,'2025-12-04 22:38:09'),(21,5,'Productividad Diaria','/reportes/maquinarias/productividad-diaria','Reporte: productividad diaria','chart-bar',2,1,'2025-12-04 22:38:09'),(22,5,'Mantenimiento Pistolas','/reportes/maquinarias/mantenimiento-pistolas','Reporte: mantenimiento de pistolas','chart-bar',3,1,'2025-12-04 22:38:09'),(23,5,'Mantenimiento Hornos','/reportes/maquinarias/mantenimiento-hornos','Reporte: mantenimiento de hornos','chart-bar',4,1,'2025-12-04 22:38:09'),(24,5,'Consumo Gas','/reportes/maquinarias/consumo-gas','Reporte: consumo de gas','chart-bar',5,1,'2025-12-04 22:38:09'),(25,6,'Gestión de Empleados','/dashboard/empleados','Listado y administración de empleados','user',1,1,'2025-12-05 17:29:31'),(26,6,'Asistencia de Empleado','/dashboard/empleados/[id]/asistencia','Registro de asistencia por empleado','calendar',2,1,'2025-12-05 17:29:31'),(27,6,'Recibos de Sueldo','/dashboard/empleados/[id]/recibos','Generación y gestión de recibos de sueldo','file-text',3,1,'2025-12-05 17:29:31'),(28,3,'Participación Clientes','/reportes/ventas/clientes',NULL,NULL,2,1,'2025-12-09 13:44:54'),(29,3,'Pintura Más Utilizada','/reportes/ventas/pintura-mas-utilizada',NULL,NULL,3,1,'2025-12-09 13:44:54'),(30,3,'Ventas por Cliente','/reportes/ventas/ventas-por-cliente',NULL,NULL,4,1,'2025-12-09 13:44:54'),(31,3,'Evolución de Ventas','/reportes/ventas/evolucion-ventas',NULL,NULL,5,1,'2025-12-09 13:44:54'),(32,3,'Consumo Pintura por Mes','/reportes/ventas/pintura-por-mes',NULL,NULL,6,1,'2025-12-09 13:44:54'),(33,3,'Ventas Cliente Específico','/reportes/ventas/ventas-cliente-especifico',NULL,NULL,7,1,'2025-12-09 13:44:54'),(40,7,'Panel Base de Datos','/dashboard/base-datos',NULL,'database',1,1,'2025-12-09 13:56:52');
/*!40000 ALTER TABLE `formulario` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
INSERT INTO `grupo` VALUES (1,'Admin',1),(2,'Operador',2),(3,'Recursos Humanos',1);
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
INSERT INTO `grupocomponente` VALUES (1,1,'2025-12-05 17:32:03'),(1,2,'2025-12-05 17:32:03'),(1,3,'2025-12-05 17:32:03'),(1,4,'2025-12-05 17:32:03'),(1,5,'2025-12-05 17:32:03'),(1,6,'2025-12-05 17:32:03'),(1,7,'2025-12-05 17:32:03'),(1,8,'2025-12-05 17:32:03'),(1,9,'2025-12-05 17:32:03'),(1,10,'2025-12-05 17:32:03'),(1,11,'2025-12-05 17:32:03'),(1,12,'2025-12-05 17:32:03'),(1,13,'2025-12-05 17:32:03'),(1,14,'2025-12-05 17:32:03'),(1,15,'2025-12-05 17:32:03'),(1,16,'2025-12-05 17:32:03'),(1,17,'2025-12-05 17:32:03'),(1,18,'2025-12-05 17:32:03'),(1,19,'2025-12-05 17:32:03'),(1,20,'2025-12-05 17:32:03'),(1,21,'2025-12-05 17:32:03'),(1,22,'2025-12-05 17:32:03'),(1,23,'2025-12-05 17:32:03'),(1,24,'2025-12-05 17:32:03'),(1,27,'2025-12-05 17:32:03'),(1,29,'2025-12-05 17:32:03'),(1,30,'2025-12-05 17:32:03'),(1,31,'2025-12-05 17:32:03'),(1,32,'2025-12-05 17:32:03'),(1,33,'2025-12-05 17:32:03'),(1,34,'2025-12-05 17:32:03'),(1,35,'2025-12-05 17:32:03'),(1,36,'2025-12-05 17:32:03'),(1,37,'2025-12-05 17:32:03'),(1,38,'2025-12-05 17:32:03'),(1,39,'2025-12-05 17:32:03'),(1,40,'2025-12-05 17:32:03'),(1,41,'2025-12-05 17:32:03'),(1,42,'2025-12-05 17:32:03'),(1,43,'2025-12-05 17:32:03'),(1,44,'2025-12-05 17:32:03'),(1,45,'2025-12-05 17:32:03'),(1,46,'2025-12-05 17:32:03'),(1,47,'2025-12-05 17:32:03'),(1,48,'2025-12-05 17:32:03'),(1,49,'2025-12-05 17:32:03'),(1,50,'2025-12-05 17:32:03'),(1,51,'2025-12-05 17:32:03'),(1,52,'2025-12-05 17:32:03'),(1,70,'2025-12-09 13:45:08'),(1,71,'2025-12-05 17:32:03'),(1,72,'2025-12-05 17:32:03'),(1,73,'2025-12-05 17:32:03'),(1,74,'2025-12-05 17:32:03'),(1,75,'2025-12-05 17:32:03'),(1,76,'2025-12-05 17:32:03'),(1,77,'2025-12-05 17:32:03'),(1,78,'2025-12-05 17:32:03'),(1,79,'2025-12-05 17:32:03'),(1,80,'2025-12-05 17:32:03'),(1,81,'2025-12-05 17:32:03'),(1,82,'2025-12-05 17:32:03'),(1,83,'2025-12-05 17:32:03'),(1,84,'2025-12-05 17:32:03'),(1,85,'2025-12-05 17:32:03'),(1,86,'2025-12-09 13:45:08'),(1,87,'2025-12-09 13:45:08'),(1,88,'2025-12-09 13:45:08'),(1,89,'2025-12-09 13:45:08'),(1,90,'2025-12-09 13:45:08'),(1,91,'2025-12-09 13:45:08'),(1,92,'2025-12-09 13:45:08'),(1,93,'2025-12-09 13:45:08'),(1,94,'2025-12-09 13:45:08'),(1,95,'2025-12-09 13:45:08'),(1,96,'2025-12-09 13:45:08'),(1,97,'2025-12-09 13:45:08'),(1,98,'2025-12-09 13:45:08'),(1,99,'2025-12-09 13:45:08'),(1,100,'2025-12-09 13:45:08'),(1,101,'2025-12-09 13:45:08'),(1,102,'2025-12-09 13:45:08'),(1,103,'2025-12-09 13:45:08'),(1,104,'2025-12-09 13:45:08'),(1,105,'2025-12-09 13:45:08'),(1,106,'2025-12-09 13:45:08'),(1,107,'2025-12-09 13:45:08'),(1,108,'2025-12-09 13:45:08'),(1,109,'2025-12-09 13:45:08'),(1,110,'2025-12-09 13:45:08'),(1,111,'2025-12-09 13:45:08'),(1,112,'2025-12-09 13:45:08'),(1,113,'2025-12-09 13:45:08'),(1,115,'2025-12-09 13:45:08'),(1,116,'2025-12-09 13:45:08'),(1,117,'2025-12-09 13:45:08'),(1,118,'2025-12-09 13:45:08'),(1,119,'2025-12-09 13:45:08'),(1,120,'2025-12-09 13:45:08'),(1,121,'2025-12-09 13:45:08'),(1,130,'2025-12-09 13:56:52'),(1,131,'2025-12-09 13:56:52'),(1,132,'2025-12-09 13:56:52'),(1,133,'2025-12-09 13:56:52'),(1,134,'2025-12-09 13:56:52'),(1,135,'2025-12-09 13:56:52'),(2,30,'2025-12-04 22:58:09'),(2,35,'2025-12-04 22:58:09'),(2,41,'2025-12-04 22:58:09'),(3,72,'2025-12-05 17:35:00'),(3,75,'2025-12-05 17:35:00'),(3,77,'2025-12-05 17:35:00'),(3,78,'2025-12-05 17:35:00');
/*!40000 ALTER TABLE `grupocomponente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupocomponenteaccion`
--

DROP TABLE IF EXISTS `grupocomponenteaccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupocomponenteaccion` (
  `id_grupo` int NOT NULL,
  `id_componente` int NOT NULL,
  `id_accion` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_grupo`,`id_componente`,`id_accion`),
  KEY `id_componente` (`id_componente`),
  KEY `id_accion` (`id_accion`),
  CONSTRAINT `grupocomponenteaccion_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`) ON DELETE CASCADE,
  CONSTRAINT `grupocomponenteaccion_ibfk_2` FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE,
  CONSTRAINT `grupocomponenteaccion_ibfk_3` FOREIGN KEY (`id_accion`) REFERENCES `accion` (`id_accion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupocomponenteaccion`
--

LOCK TABLES `grupocomponenteaccion` WRITE;
/*!40000 ALTER TABLE `grupocomponenteaccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupocomponenteaccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupousuario`
--

DROP TABLE IF EXISTS `grupousuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupousuario` (
  `id_grupo` int NOT NULL,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_grupo`,`id_usuario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `grupousuario_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`),
  CONSTRAINT `grupousuario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupousuario`
--

LOCK TABLES `grupousuario` WRITE;
/*!40000 ALTER TABLE `grupousuario` DISABLE KEYS */;
INSERT INTO `grupousuario` VALUES (1,1),(2,2),(3,2);
/*!40000 ALTER TABLE `grupousuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_backup`
--

DROP TABLE IF EXISTS `historial_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_backup` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_politica` int NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `estado` enum('en_progreso','completado','fallido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_progreso',
  `archivo_generado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tamano_bytes` bigint DEFAULT NULL,
  `tablas_respaldadas` text COLLATE utf8mb4_unicode_ci,
  `mensaje_error` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `idx_politica` (`id_politica`),
  KEY `idx_fecha` (`fecha_inicio`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_historial_politica` FOREIGN KEY (`id_politica`) REFERENCES `politica_backup` (`id_politica`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_backup`
--

LOCK TABLES `historial_backup` WRITE;
/*!40000 ALTER TABLE `historial_backup` DISABLE KEYS */;
INSERT INTO `historial_backup` VALUES (1,7,'2025-12-09 11:01:17','2025-12-09 11:01:17','fallido',NULL,NULL,NULL,'Command failed: mysqldump -h localhost -u root electrotech2 usuario > \"C:\\DOCUMENTOS IGNA\\IgnaOffice\\UAI\\TERCER AÑO\\Segundo cuatrimestre\\Trabajo de diploma\\GitHub2\\electrotech-v2\\backups\\backup_parcial_2025-12-09T14-01-17-013Z.sql\"\n\"mysqldump\" no se reconoce como un comando interno o externo,\r\nprograma o archivo por lotes ejecutable.\r\n','2025-12-09 14:01:17'),(2,7,'2025-12-09 11:04:04','2025-12-09 11:04:04','fallido',NULL,NULL,NULL,'Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h localhost -u root electrotech2 usuario > \"C:\\DOCUMENTOS IGNA\\IgnaOffice\\UAI\\TERCER AÑO\\Segundo cuatrimestre\\Trabajo de diploma\\GitHub2\\electrotech-v2\\backups\\backup_parcial_2025-12-09T14-04-04-672Z.sql\"\nmysqldump: Got error: 1045: Access denied for user \'root\'@\'localhost\' (using password: NO) when trying to connect\r\n','2025-12-09 14:04:04'),(3,7,'2025-12-09 11:07:11','2025-12-09 11:07:11','fallido',NULL,NULL,NULL,'Command failed: \"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe\" -h localhost -u root electrotech2 usuario > \"C:\\DOCUMENTOS IGNA\\IgnaOffice\\UAI\\TERCER AÑO\\Segundo cuatrimestre\\Trabajo de diploma\\GitHub2\\electrotech-v2\\backups\\backup_parcial_2025-12-09T14-07-11-462Z.sql\"\nmysqldump: Got error: 1045: Access denied for user \'root\'@\'localhost\' (using password: NO) when trying to connect\r\n','2025-12-09 14:07:11'),(4,7,'2025-12-09 11:08:28','2025-12-09 11:08:28','completado','backup_parcial_2025-12-09T14-08-28-318Z.sql',2817,'usuario',NULL,'2025-12-09 14:08:28'),(5,5,'2025-12-09 11:09:31',NULL,'en_progreso',NULL,NULL,NULL,NULL,'2025-12-09 14:09:31');
/*!40000 ALTER TABLE `historial_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horno`
--

DROP TABLE IF EXISTS `horno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horno` (
  `id_horno` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `horas_uso` decimal(10,2) DEFAULT '0.00',
  `horas_mantenimiento` int DEFAULT '0',
  `temperatura_max` decimal(7,2) DEFAULT NULL,
  `gasto_gas_hora` decimal(10,2) DEFAULT NULL,
  `ultimo_mantenimiento` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_horno`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horno`
--

LOCK TABLES `horno` WRITE;
/*!40000 ALTER TABLE `horno` DISABLE KEYS */;
INSERT INTO `horno` VALUES (1,'Horno Principal 1','Horno principal de secado rápido',721.05,1000,220.00,2.50,'2025-09-15','activo','2025-12-04 17:26:09'),(2,'Horno Principal 2','Horno principal de respaldo',582.70,1000,220.00,2.50,'2025-10-01','activo','2025-12-04 17:26:09'),(3,'Horno Curado Grande','Horno de curado para piezas grandes',855.60,1000,250.00,3.00,'2025-08-01','activo','2025-12-04 17:26:09'),(4,'Horno Pequeño A','Horno pequeño para componentes',320.00,1000,180.00,1.50,'2025-11-01','activo','2025-12-04 17:26:09');
/*!40000 ALTER TABLE `horno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maquinaria`
--

DROP TABLE IF EXISTS `maquinaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maquinaria` (
  `id_maquinaria` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(150) DEFAULT NULL,
  `horas_uso` decimal(10,2) DEFAULT '0.00',
  `max_piezas_diarias` int NOT NULL,
  PRIMARY KEY (`id_maquinaria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maquinaria`
--

LOCK TABLES `maquinaria` WRITE;
/*!40000 ALTER TABLE `maquinaria` DISABLE KEYS */;
/*!40000 ALTER TABLE `maquinaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maquinariahistorial`
--

DROP TABLE IF EXISTS `maquinariahistorial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maquinariahistorial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_maquinaria` int NOT NULL,
  `fecha` date NOT NULL,
  `piezas_pintadas` int NOT NULL,
  `id_pieza` int DEFAULT NULL,
  `id_pintura` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_maquinaria` (`id_maquinaria`),
  KEY `id_pieza` (`id_pieza`),
  KEY `id_pintura` (`id_pintura`),
  CONSTRAINT `maquinariahistorial_ibfk_1` FOREIGN KEY (`id_maquinaria`) REFERENCES `maquinaria` (`id_maquinaria`),
  CONSTRAINT `maquinariahistorial_ibfk_2` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`),
  CONSTRAINT `maquinariahistorial_ibfk_3` FOREIGN KEY (`id_pintura`) REFERENCES `pintura` (`id_pintura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maquinariahistorial`
--

LOCK TABLES `maquinariahistorial` WRITE;
/*!40000 ALTER TABLE `maquinariahistorial` DISABLE KEYS */;
/*!40000 ALTER TABLE `maquinariahistorial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `id_marca` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES (1,'WEG'),(2,'LAP');
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
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
INSERT INTO `modulo` VALUES (1,'Piezas y Pinturas','Gestión de piezas, pinturas y producción','package',1,1,'2025-12-04 17:20:18'),(2,'Facturación','Facturas, remitos y clientes','receipt',2,1,'2025-12-04 17:20:18'),(3,'Reportes','Reportes y estadísticas del sistema','chart-bar',3,1,'2025-12-04 17:20:18'),(4,'Administración','Configuración y permisos','settings',4,1,'2025-12-04 17:20:18'),(5,'Empleados y Nómina','Gestión de empleados, asistencia y recibos de sueldo','users',5,1,'2025-12-04 22:24:10'),(6,'Maquinarias','Gestión de cabinas, pistolas y hornos','settings-2',6,1,'2025-12-05 17:29:31'),(7,'Base de Datos','Gestión de backups y mantenimiento de BD','database',7,1,'2025-12-09 13:56:52');
/*!40000 ALTER TABLE `modulo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pieza`
--

DROP TABLE IF EXISTS `pieza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pieza` (
  `id_pieza` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `ancho_m` decimal(10,2) NOT NULL,
  `alto_m` decimal(10,2) NOT NULL,
  `detalle` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_pieza`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `pieza_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pieza`
--

LOCK TABLES `pieza` WRITE;
/*!40000 ALTER TABLE `pieza` DISABLE KEYS */;
INSERT INTO `pieza` VALUES (1,1,0.50,0.30,'Tapa de motor pequeña'),(2,1,0.80,0.60,'Panel lateral derecho'),(3,1,0.80,0.60,'Panel lateral izquierdo'),(4,1,1.20,0.40,'Capot delantero'),(5,2,1.50,1.00,'Puerta industrial tipo A'),(6,2,1.50,1.00,'Puerta industrial tipo B'),(7,2,2.00,1.50,'Panel estructural grande'),(8,3,0.60,0.40,'Soporte metálico reforzado'),(9,3,0.90,0.70,'Base de maquinaria'),(10,3,1.00,0.80,'Cubierta protectora'),(11,4,0.40,0.30,'Componente pequeño A'),(12,4,0.40,0.30,'Componente pequeño B'),(13,4,1.10,0.90,'Estructura mediana'),(14,5,0.70,0.50,'Carcasa electrónica'),(15,5,1.30,1.00,'Panel de control');
/*!40000 ALTER TABLE `pieza` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `piezapintada`
--

DROP TABLE IF EXISTS `piezapintada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `piezapintada` (
  `id_pieza_pintada` int NOT NULL AUTO_INCREMENT,
  `id_pieza` int NOT NULL,
  `id_pintura` int NOT NULL,
  `id_cabina` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `cantidad_facturada` int NOT NULL DEFAULT '0',
  `fecha` date NOT NULL,
  `consumo_estimado_kg` decimal(10,3) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pieza_pintada`),
  KEY `idx_piezapintada_id_pieza` (`id_pieza`),
  KEY `idx_piezapintada_id_pintura` (`id_pintura`),
  KEY `idx_piezapintada_id_cabina` (`id_cabina`),
  CONSTRAINT `piezapintada_ibfk_1` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`),
  CONSTRAINT `piezapintada_ibfk_2` FOREIGN KEY (`id_pintura`) REFERENCES `pintura` (`id_pintura`),
  CONSTRAINT `piezapintada_ibfk_3` FOREIGN KEY (`id_cabina`) REFERENCES `cabina` (`id_cabina`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `piezapintada`
--

LOCK TABLES `piezapintada` WRITE;
/*!40000 ALTER TABLE `piezapintada` DISABLE KEYS */;
INSERT INTO `piezapintada` VALUES (1,1,6,1,40,40,'2025-09-05',3.000,'2025-12-04 23:11:28'),(2,2,3,2,35,35,'2025-09-06',8.400,'2025-12-04 23:11:28'),(3,3,3,3,35,35,'2025-09-06',8.400,'2025-12-04 23:11:28'),(4,4,2,4,40,40,'2025-09-07',9.600,'2025-12-04 23:11:28'),(5,5,4,1,30,30,'2025-09-10',22.500,'2025-12-04 23:11:28'),(6,6,4,2,30,30,'2025-09-10',22.500,'2025-12-04 23:11:28'),(7,7,19,3,30,30,'2025-09-12',45.000,'2025-12-04 23:11:28'),(8,8,8,4,40,40,'2025-09-15',6.720,'2025-12-04 23:11:28'),(9,9,6,1,30,30,'2025-09-16',9.450,'2025-12-04 23:11:28'),(10,10,12,2,30,30,'2025-09-18',12.000,'2025-12-04 23:11:28'),(11,11,15,3,50,50,'2025-10-05',3.000,'2025-12-04 23:11:28'),(12,12,15,4,50,50,'2025-10-05',3.000,'2025-12-04 23:11:28'),(13,13,16,1,25,25,'2025-10-07',12.375,'2025-12-04 23:11:28'),(14,14,9,2,35,35,'2025-10-10',6.125,'2025-12-04 23:11:28'),(15,15,17,3,35,35,'2025-10-12',22.750,'2025-12-04 23:11:28'),(16,1,1,4,35,35,'2025-10-15',2.625,'2025-12-04 23:11:28'),(17,2,10,1,35,35,'2025-10-16',8.400,'2025-12-04 23:11:28'),(18,3,10,2,35,35,'2025-10-16',8.400,'2025-12-04 23:11:28'),(19,4,7,3,35,35,'2025-10-17',8.400,'2025-12-04 23:11:28'),(20,5,17,4,25,25,'2025-10-20',18.750,'2025-12-04 23:11:28'),(21,6,17,1,25,25,'2025-10-20',18.750,'2025-12-04 23:11:28'),(22,7,10,2,25,25,'2025-10-22',37.500,'2025-12-04 23:11:28'),(23,1,6,3,50,50,'2025-11-02',3.750,'2025-12-04 23:11:28'),(24,2,3,4,40,40,'2025-11-03',9.600,'2025-12-04 23:11:28'),(25,3,3,1,40,40,'2025-11-03',9.600,'2025-12-04 23:11:28'),(26,4,2,2,45,45,'2025-11-04',10.800,'2025-12-04 23:11:28'),(27,8,20,3,50,50,'2025-11-07',8.400,'2025-12-04 23:11:28'),(28,9,15,4,40,40,'2025-11-08',12.600,'2025-12-04 23:11:28'),(29,10,12,1,35,35,'2025-11-09',14.000,'2025-12-04 23:11:28'),(30,11,1,2,60,60,'2025-11-12',3.600,'2025-12-04 23:11:28'),(31,12,1,3,60,60,'2025-11-12',3.600,'2025-12-04 23:11:28'),(32,13,2,4,30,30,'2025-11-13',14.850,'2025-12-04 23:11:28'),(33,5,4,1,35,35,'2025-11-15',26.250,'2025-12-04 23:11:28'),(34,6,4,2,35,35,'2025-11-15',26.250,'2025-12-04 23:11:28'),(35,7,19,3,30,30,'2025-11-16',45.000,'2025-12-04 23:11:28'),(36,14,21,4,40,40,'2025-11-19',7.000,'2025-12-04 23:11:28'),(37,15,17,1,35,35,'2025-11-20',22.750,'2025-12-04 23:11:28'),(38,1,15,2,35,35,'2025-11-23',2.625,'2025-12-04 23:11:28'),(39,2,19,3,30,30,'2025-11-24',7.200,'2025-12-04 23:11:28'),(40,3,19,4,30,30,'2025-11-24',7.200,'2025-12-04 23:11:28'),(41,4,16,1,35,35,'2025-11-25',8.400,'2025-12-04 23:11:28'),(42,8,8,2,45,40,'2025-11-26',7.560,'2025-12-04 23:11:28'),(43,9,6,3,35,30,'2025-11-27',11.025,'2025-12-04 23:11:28'),(44,10,11,4,30,25,'2025-11-28',12.000,'2025-12-04 23:11:28'),(45,11,22,1,30,0,'2025-12-04',0.339,'2025-12-04 23:14:29'),(46,8,14,1,11,0,'2025-12-04',0.249,'2025-12-04 23:39:23'),(47,10,15,3,11,0,'2025-12-04',0.830,'2025-12-04 23:40:50'),(48,13,16,3,12,0,'2025-12-04',1.120,'2025-12-04 23:42:11'),(49,9,17,3,32,0,'2025-12-04',1.901,'2025-12-04 23:45:24'),(50,12,16,2,1,0,'2025-12-05',0.011,'2025-12-05 14:24:04'),(51,12,17,2,18,0,'2025-12-05',0.204,'2025-12-05 14:30:34'),(52,12,19,3,1,0,'2025-12-05',0.011,'2025-12-05 14:36:20');
/*!40000 ALTER TABLE `piezapintada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pintura`
--

DROP TABLE IF EXISTS `pintura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pintura` (
  `id_pintura` int NOT NULL AUTO_INCREMENT,
  `id_marca` int NOT NULL,
  `id_color` int NOT NULL,
  `id_tipo` int NOT NULL,
  `id_proveedor` int NOT NULL,
  `cantidad_kg` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pintura`),
  KEY `id_marca` (`id_marca`),
  KEY `id_color` (`id_color`),
  KEY `id_tipo` (`id_tipo`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `pintura_ibfk_1` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  CONSTRAINT `pintura_ibfk_2` FOREIGN KEY (`id_color`) REFERENCES `color` (`id_color`),
  CONSTRAINT `pintura_ibfk_3` FOREIGN KEY (`id_tipo`) REFERENCES `tipopintura` (`id_tipo`),
  CONSTRAINT `pintura_ibfk_4` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pintura`
--

LOCK TABLES `pintura` WRITE;
/*!40000 ALTER TABLE `pintura` DISABLE KEYS */;
INSERT INTO `pintura` VALUES (1,1,1,1,1,500.00,75.50),(2,1,2,1,1,600.00,72.00),(3,1,3,1,2,450.00,74.00),(4,1,4,1,1,400.00,76.00),(5,1,5,1,2,350.00,78.00),(6,1,1,2,2,550.00,73.00),(7,1,2,2,1,500.00,71.00),(8,1,6,2,3,400.00,74.50),(9,1,7,2,2,350.00,75.00),(10,1,3,3,2,450.00,72.50),(11,1,8,3,3,300.00,77.00),(12,1,9,3,1,380.00,79.00),(13,1,1,4,2,400.00,80.00),(14,1,10,4,3,349.75,76.50),(15,2,1,1,1,549.17,74.00),(16,2,2,1,2,578.87,70.50),(17,2,4,1,3,417.90,75.50),(18,2,5,1,1,380.00,77.50),(19,2,3,2,2,499.99,72.00),(20,2,6,2,3,430.00,73.50),(21,2,7,2,1,360.00,74.00),(22,2,1,5,2,449.66,81.00),(23,2,3,5,3,400.00,79.50),(24,2,10,6,1,380.00,78.00),(25,2,8,6,2,320.00,80.50);
/*!40000 ALTER TABLE `pintura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pistola`
--

DROP TABLE IF EXISTS `pistola`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pistola` (
  `id_pistola` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `horas_uso` decimal(10,2) DEFAULT '0.00',
  `horas_mantenimiento` int DEFAULT '0',
  `ultimo_mantenimiento` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'activa',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pistola`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pistola`
--

LOCK TABLES `pistola` WRITE;
/*!40000 ALTER TABLE `pistola` DISABLE KEYS */;
INSERT INTO `pistola` VALUES (1,'Pistola Automática A1','Pistola automática de alta precisión',251.05,500,'2025-10-01','activa','2025-12-04 17:26:09'),(2,'Pistola Automática A2','Pistola automática secundaria',180.80,500,'2025-10-15','activa','2025-12-04 17:26:09'),(3,'Pistola Manual B1','Pistola manual para detalles finos',420.95,500,'2025-08-20','activa','2025-12-04 17:26:09'),(4,'Pistola Manual B2','Pistola manual de respaldo',85.95,500,'2025-11-01','activa','2025-12-04 17:26:09'),(5,'Pistola Precision C1','Pistola de precisión para piezas pequeñas',356.35,500,'2025-09-10','activa','2025-12-04 17:26:09'),(6,'Pistola Industrial D1','Pistola industrial de alto volumen',480.00,500,'2025-07-15','mantenimiento','2025-12-04 17:26:09');
/*!40000 ALTER TABLE `pistola` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `politica_backup`
--

DROP TABLE IF EXISTS `politica_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `politica_backup` (
  `id_politica` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('completo','parcial','incremental') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completo',
  `tablas_seleccionadas` text COLLATE utf8mb4_unicode_ci COMMENT 'Lista de tablas separadas por coma para backup parcial',
  `frecuencia` enum('diario','semanal','mensual','unico') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'diario',
  `hora_ejecucion` time NOT NULL DEFAULT '02:00:00',
  `dia_semana` tinyint DEFAULT NULL COMMENT '0=Domingo, 1=Lunes, ..., 6=Sábado (para frecuencia semanal)',
  `dia_mes` tinyint DEFAULT NULL COMMENT 'Día del mes 1-28 (para frecuencia mensual)',
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `ultima_ejecucion` datetime DEFAULT NULL,
  `proxima_ejecucion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_politica`),
  KEY `idx_activa` (`activa`),
  KEY `idx_frecuencia` (`frecuencia`),
  KEY `idx_proxima_ejecucion` (`proxima_ejecucion`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `politica_backup`
--

LOCK TABLES `politica_backup` WRITE;
/*!40000 ALTER TABLE `politica_backup` DISABLE KEYS */;
INSERT INTO `politica_backup` VALUES (5,'Backup Completo Semanal','completo',NULL,'semanal','03:00:00',0,NULL,1,NULL,NULL,'2025-12-09 13:56:52','2025-12-09 13:56:52'),(6,'Backup Diario Incremental','incremental',NULL,'diario','02:00:00',NULL,NULL,1,NULL,NULL,'2025-12-09 13:56:52','2025-12-09 13:56:52'),(7,'aaaaaa','parcial','usuario','diario','11:00:00',NULL,NULL,1,'2025-12-09 11:08:28','2025-12-09 11:00:00','2025-12-09 13:59:24','2025-12-09 14:08:28');
/*!40000 ALTER TABLE `politica_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Pinturas del Plata','Av. Mitre 5678, CABA'),(2,'Colores Industriales','Parque Industrial Sur, Quilmes'),(3,'Recubrimientos Premium','Zona Franca, Tucumán');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedorpintura`
--

DROP TABLE IF EXISTS `proveedorpintura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedorpintura` (
  `id_proveedor` int NOT NULL,
  `id_pintura` int NOT NULL,
  PRIMARY KEY (`id_proveedor`,`id_pintura`),
  KEY `id_pintura` (`id_pintura`),
  CONSTRAINT `proveedorpintura_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `proveedorpintura_ibfk_2` FOREIGN KEY (`id_pintura`) REFERENCES `pintura` (`id_pintura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedorpintura`
--

LOCK TABLES `proveedorpintura` WRITE;
/*!40000 ALTER TABLE `proveedorpintura` DISABLE KEYS */;
INSERT INTO `proveedorpintura` VALUES (1,1),(1,2),(2,3),(1,4),(2,5),(2,6),(1,7),(3,8),(2,9),(2,10),(3,11),(1,12),(2,13),(3,14),(1,15),(2,16),(3,17),(1,18),(2,19),(3,20),(1,21),(2,22),(3,23),(1,24),(2,25);
/*!40000 ALTER TABLE `proveedorpintura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recibo_sueldo`
--

DROP TABLE IF EXISTS `recibo_sueldo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recibo_sueldo` (
  `id_recibo` int NOT NULL AUTO_INCREMENT,
  `id_empleado` int NOT NULL,
  `periodo_quincena` tinyint(1) NOT NULL COMMENT '1 = primera quincena, 2 = segunda quincena',
  `periodo_mes` tinyint NOT NULL,
  `periodo_anio` smallint NOT NULL,
  `fecha_desde` date NOT NULL,
  `fecha_hasta` date NOT NULL,
  `salario_base` decimal(10,2) NOT NULL,
  `presentismo` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '9% del salario base si corresponde',
  `horas_extra_monto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `bonificaciones` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento_ausencias` decimal(10,2) NOT NULL DEFAULT '0.00',
  `otros_descuentos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_haberes` decimal(10,2) NOT NULL,
  `total_descuentos` decimal(10,2) NOT NULL,
  `total_neto` decimal(10,2) NOT NULL,
  `dias_trabajados` int NOT NULL DEFAULT '0',
  `dias_ausentes_justificados` int NOT NULL DEFAULT '0',
  `dias_ausentes_injustificados` int NOT NULL DEFAULT '0',
  `total_horas_extra` decimal(6,2) NOT NULL DEFAULT '0.00',
  `observaciones` text,
  `generado_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_recibo`),
  UNIQUE KEY `uk_recibo_periodo` (`id_empleado`,`periodo_quincena`,`periodo_mes`,`periodo_anio`),
  KEY `idx_periodo` (`periodo_anio`,`periodo_mes`,`periodo_quincena`),
  CONSTRAINT `recibo_sueldo_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recibo_sueldo`
--

LOCK TABLES `recibo_sueldo` WRITE;
/*!40000 ALTER TABLE `recibo_sueldo` DISABLE KEYS */;
INSERT INTO `recibo_sueldo` VALUES (1,1,1,10,2025,'2025-10-01','2025-10-15',225000.00,20250.00,0.00,0.00,0.00,0.00,245250.00,0.00,245250.00,11,0,0,0.00,NULL,'2025-12-05 17:55:52'),(2,3,1,10,2025,'2025-10-01','2025-10-15',260000.00,0.00,0.00,0.00,17333.33,0.00,260000.00,17333.33,242666.67,10,0,1,0.00,NULL,'2025-12-05 17:55:52'),(3,4,1,10,2025,'2025-10-01','2025-10-15',215000.00,19350.00,0.00,0.00,0.00,0.00,234350.00,0.00,234350.00,11,0,0,0.00,NULL,'2025-12-05 17:55:53'),(4,5,1,10,2025,'2025-10-01','2025-10-15',360000.00,32400.00,13500.00,0.00,0.00,0.00,405900.00,0.00,405900.00,11,0,0,6.00,NULL,'2025-12-05 17:55:53'),(5,1,2,10,2025,'2025-10-16','2025-10-31',225000.00,20250.00,0.00,0.00,0.00,0.00,245250.00,0.00,245250.00,12,0,0,0.00,NULL,'2025-12-05 17:55:53'),(6,3,2,10,2025,'2025-10-16','2025-10-31',260000.00,23400.00,0.00,0.00,0.00,0.00,283400.00,0.00,283400.00,12,0,0,0.00,NULL,'2025-12-05 17:55:53'),(7,4,2,10,2025,'2025-10-16','2025-10-31',215000.00,19350.00,0.00,0.00,0.00,0.00,234350.00,0.00,234350.00,12,0,0,0.00,NULL,'2025-12-05 17:55:53'),(8,5,2,10,2025,'2025-10-16','2025-10-31',360000.00,32400.00,27000.00,0.00,0.00,0.00,419400.00,0.00,419400.00,12,0,0,8.00,NULL,'2025-12-05 17:55:53'),(9,1,1,11,2025,'2025-11-01','2025-11-15',225000.00,20250.00,0.00,0.00,0.00,0.00,245250.00,0.00,245250.00,10,0,0,0.00,NULL,'2025-12-05 17:55:53'),(10,3,1,11,2025,'2025-11-01','2025-11-15',260000.00,0.00,0.00,0.00,34666.66,0.00,260000.00,34666.66,225333.34,8,0,2,0.00,NULL,'2025-12-05 17:55:53'),(11,4,1,11,2025,'2025-11-01','2025-11-15',215000.00,19350.00,0.00,0.00,0.00,0.00,234350.00,0.00,234350.00,9,1,0,0.00,NULL,'2025-12-05 17:55:53'),(12,5,1,11,2025,'2025-11-01','2025-11-15',360000.00,32400.00,67500.00,0.00,0.00,0.00,459900.00,0.00,459900.00,12,0,0,15.00,NULL,'2025-12-05 17:55:53'),(13,1,2,11,2025,'2025-11-16','2025-11-30',225000.00,20250.00,0.00,0.00,0.00,0.00,245250.00,0.00,245250.00,10,0,0,0.00,NULL,'2025-12-05 17:55:53'),(14,3,2,11,2025,'2025-11-16','2025-11-30',260000.00,23400.00,0.00,0.00,0.00,0.00,283400.00,0.00,283400.00,10,0,0,0.00,NULL,'2025-12-05 17:55:53'),(15,4,2,11,2025,'2025-11-16','2025-11-30',215000.00,19350.00,0.00,0.00,0.00,0.00,234350.00,0.00,234350.00,10,0,0,0.00,NULL,'2025-12-05 17:55:53'),(16,5,2,11,2025,'2025-11-16','2025-11-30',360000.00,32400.00,11250.00,0.00,0.00,0.00,403650.00,0.00,403650.00,10,0,0,5.00,NULL,'2025-12-05 17:55:53');
/*!40000 ALTER TABLE `recibo_sueldo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remito`
--

DROP TABLE IF EXISTS `remito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remito` (
  `id_remito` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `fecha_recepcion` datetime NOT NULL,
  `cantidad_piezas` int NOT NULL,
  PRIMARY KEY (`id_remito`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `remito_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remito`
--

LOCK TABLES `remito` WRITE;
/*!40000 ALTER TABLE `remito` DISABLE KEYS */;
INSERT INTO `remito` VALUES (1,1,'2025-09-02 08:30:00',300),(2,2,'2025-09-05 09:00:00',180),(3,3,'2025-09-10 10:15:00',200),(4,4,'2025-10-03 11:00:00',250),(5,5,'2025-10-07 08:45:00',140),(6,1,'2025-10-12 09:30:00',280),(7,2,'2025-10-18 10:00:00',150),(8,1,'2025-11-01 08:30:00',350),(9,3,'2025-11-05 10:15:00',250),(10,4,'2025-11-08 11:00:00',300),(11,2,'2025-11-12 09:00:00',200),(12,5,'2025-11-18 08:45:00',150),(13,1,'2025-11-22 09:00:00',260),(14,3,'2025-11-25 10:30:00',220);
/*!40000 ALTER TABLE `remito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remitodetalle`
--

DROP TABLE IF EXISTS `remitodetalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remitodetalle` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_remito` int NOT NULL,
  `id_pieza` int NOT NULL,
  `cantidad` int NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_remito` (`id_remito`),
  KEY `id_pieza` (`id_pieza`),
  CONSTRAINT `remitodetalle_ibfk_1` FOREIGN KEY (`id_remito`) REFERENCES `remito` (`id_remito`),
  CONSTRAINT `remitodetalle_ibfk_2` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remitodetalle`
--

LOCK TABLES `remitodetalle` WRITE;
/*!40000 ALTER TABLE `remitodetalle` DISABLE KEYS */;
INSERT INTO `remitodetalle` VALUES (1,1,1,80),(2,1,2,70),(3,1,3,70),(4,1,4,80),(5,2,5,60),(6,2,6,60),(7,2,7,60),(8,3,8,80),(9,3,9,60),(10,3,10,60),(11,4,11,100),(12,4,12,81),(13,4,13,50),(14,5,14,70),(15,5,15,70),(16,6,1,70),(17,6,2,70),(18,6,3,70),(19,6,4,70),(20,7,5,50),(21,7,6,50),(22,7,7,50),(23,8,1,100),(24,8,2,80),(25,8,3,80),(26,8,4,90),(27,9,8,100),(28,9,9,80),(29,9,10,70),(30,10,11,120),(31,10,12,120),(32,10,13,60),(33,11,5,70),(34,11,6,70),(35,11,7,60),(36,12,14,80),(37,12,15,70),(38,13,1,70),(39,13,2,60),(40,13,3,60),(41,13,4,70),(42,14,8,90),(43,14,9,70),(44,14,10,60);
/*!40000 ALTER TABLE `remitodetalle` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_remitodetalle_ai_stock` AFTER INSERT ON `remitodetalle` FOR EACH ROW BEGIN
  INSERT INTO StockPieza (id_pieza, total_recibida, stock_disponible)
  VALUES (NEW.id_pieza, NEW.cantidad, NEW.cantidad)
  ON DUPLICATE KEY UPDATE
    total_recibida   = total_recibida   + NEW.cantidad,
    stock_disponible = stock_disponible + NEW.cantidad;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `resetpasswordtoken`
--

DROP TABLE IF EXISTS `resetpasswordtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resetpasswordtoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resetpasswordtoken`
--

LOCK TABLES `resetpasswordtoken` WRITE;
/*!40000 ALTER TABLE `resetpasswordtoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `resetpasswordtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stockpieza`
--

DROP TABLE IF EXISTS `stockpieza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stockpieza` (
  `id_pieza` int NOT NULL,
  `total_recibida` int NOT NULL DEFAULT '0',
  `total_pintada` int NOT NULL DEFAULT '0',
  `stock_disponible` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_pieza`),
  CONSTRAINT `stockpieza_ibfk_1` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stockpieza`
--

LOCK TABLES `stockpieza` WRITE;
/*!40000 ALTER TABLE `stockpieza` DISABLE KEYS */;
INSERT INTO `stockpieza` VALUES (1,320,160,160),(2,280,140,140),(3,280,140,140),(4,310,155,155),(5,180,90,90),(6,180,90,90),(7,170,85,85),(8,270,135,135),(9,210,105,105),(10,190,95,95),(11,220,110,110),(12,220,110,110),(13,110,55,55),(14,150,75,75),(15,140,70,70);
/*!40000 ALTER TABLE `stockpieza` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipopintura`
--

DROP TABLE IF EXISTS `tipopintura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipopintura` (
  `id_tipo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipopintura`
--

LOCK TABLES `tipopintura` WRITE;
/*!40000 ALTER TABLE `tipopintura` DISABLE KEYS */;
INSERT INTO `tipopintura` VALUES (1,'Brillante'),(2,'Mate'),(3,'Semi Mate'),(4,'Texturado'),(5,'Texturado Fino'),(6,'Texturado Grueso');
/*!40000 ALTER TABLE `tipopintura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('ADMIN','OPERARIO','GERENTE') DEFAULT 'OPERARIO',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Ignacio','Criscenti','igcriscenti@gmail.com','$2b$10$mhrjfGcjd48jlt36mXg78uRYv/9g2vnFYKD/1Hh/o.e6SXFEYUvSS','OPERARIO','2025-12-04 15:36:36'),(2,'Juan','Gimenez','JuanGimenez@gmail.com','$2b$10$LWnOuvjCM5wGlq15Dogw9e247H6V7Miy1WviHig7p0rSDnbNC2f3u','OPERARIO','2025-12-04 19:43:05');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_estructura_permisos`
--

DROP TABLE IF EXISTS `v_estructura_permisos`;
/*!50001 DROP VIEW IF EXISTS `v_estructura_permisos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_estructura_permisos` AS SELECT 
 1 AS `id_modulo`,
 1 AS `modulo`,
 1 AS `id_formulario`,
 1 AS `formulario`,
 1 AS `ruta`,
 1 AS `id_componente`,
 1 AS `componente`,
 1 AS `tipo_componente`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_permisos_grupo`
--

DROP TABLE IF EXISTS `v_permisos_grupo`;
/*!50001 DROP VIEW IF EXISTS `v_permisos_grupo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_permisos_grupo` AS SELECT 
 1 AS `id_grupo`,
 1 AS `grupo`,
 1 AS `modulo`,
 1 AS `formulario`,
 1 AS `ruta`,
 1 AS `id_componente`,
 1 AS `componente`,
 1 AS `tipo_componente`,
 1 AS `fecha_asignacion`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_resumen_asistencia`
--

DROP TABLE IF EXISTS `v_resumen_asistencia`;
/*!50001 DROP VIEW IF EXISTS `v_resumen_asistencia`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_resumen_asistencia` AS SELECT 
 1 AS `id_empleado`,
 1 AS `nombre`,
 1 AS `apellido`,
 1 AS `dni`,
 1 AS `salario_base`,
 1 AS `anio`,
 1 AS `mes`,
 1 AS `dias_presentes`,
 1 AS `ausencias_justificadas`,
 1 AS `ausencias_injustificadas`,
 1 AS `total_horas_extra`,
 1 AS `sabados_trabajados`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_estructura_permisos`
--

/*!50001 DROP VIEW IF EXISTS `v_estructura_permisos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_estructura_permisos` AS select `m`.`id_modulo` AS `id_modulo`,`m`.`nombre` AS `modulo`,`f`.`id_formulario` AS `id_formulario`,`f`.`nombre` AS `formulario`,`f`.`ruta` AS `ruta`,`c`.`id_componente` AS `id_componente`,`c`.`nombre` AS `componente`,`c`.`tipo` AS `tipo_componente` from ((`modulo` `m` join `formulario` `f` on((`f`.`id_modulo` = `m`.`id_modulo`))) join `componente` `c` on((`c`.`id_formulario` = `f`.`id_formulario`))) where ((`m`.`activo` = true) and (`f`.`activo` = true) and (`c`.`activo` = true)) order by `m`.`orden`,`f`.`orden`,`c`.`id_componente` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_permisos_grupo`
--

/*!50001 DROP VIEW IF EXISTS `v_permisos_grupo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_permisos_grupo` AS select `g`.`id_grupo` AS `id_grupo`,`g`.`nombre` AS `grupo`,`m`.`nombre` AS `modulo`,`f`.`nombre` AS `formulario`,`f`.`ruta` AS `ruta`,`c`.`id_componente` AS `id_componente`,`c`.`nombre` AS `componente`,`c`.`tipo` AS `tipo_componente`,`gc`.`fecha_asignacion` AS `fecha_asignacion` from ((((`grupo` `g` join `grupocomponente` `gc` on((`gc`.`id_grupo` = `g`.`id_grupo`))) join `componente` `c` on((`c`.`id_componente` = `gc`.`id_componente`))) join `formulario` `f` on((`f`.`id_formulario` = `c`.`id_formulario`))) join `modulo` `m` on((`m`.`id_modulo` = `f`.`id_modulo`))) order by `g`.`nombre`,`m`.`orden`,`f`.`orden` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_resumen_asistencia`
--

/*!50001 DROP VIEW IF EXISTS `v_resumen_asistencia`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_resumen_asistencia` AS select `e`.`id_empleado` AS `id_empleado`,`e`.`nombre` AS `nombre`,`e`.`apellido` AS `apellido`,`e`.`dni` AS `dni`,`e`.`salario_base` AS `salario_base`,year(`a`.`fecha`) AS `anio`,month(`a`.`fecha`) AS `mes`,sum((case when (`a`.`presente` = 1) then 1 else 0 end)) AS `dias_presentes`,sum((case when ((`a`.`presente` = 0) and (`a`.`justificada` = 1)) then 1 else 0 end)) AS `ausencias_justificadas`,sum((case when ((`a`.`presente` = 0) and (`a`.`justificada` = 0)) then 1 else 0 end)) AS `ausencias_injustificadas`,sum(coalesce(`a`.`horas_extra`,0)) AS `total_horas_extra`,sum((case when ((`a`.`es_sabado` = 1) and (`a`.`presente` = 1)) then 1 else 0 end)) AS `sabados_trabajados` from (`empleado` `e` left join `asistencia` `a` on((`a`.`id_empleado` = `e`.`id_empleado`))) where (`e`.`activo` = 1) group by `e`.`id_empleado`,`e`.`nombre`,`e`.`apellido`,`e`.`dni`,`e`.`salario_base`,year(`a`.`fecha`),month(`a`.`fecha`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-09 11:09:32
