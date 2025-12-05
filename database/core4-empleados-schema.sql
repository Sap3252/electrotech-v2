-- ==========================================
-- CORE 4 - EMPLEADOS, ASISTENCIA Y RECIBOS
-- ==========================================
-- Script de migración para el sistema de empleados
-- Date: 2025-12-05
-- ==========================================

USE electrotech2;

-- ==========================================
-- ELIMINAR TABLAS ANTIGUAS
-- ==========================================

-- Eliminar tabla salario antigua (si tiene FK, primero deshabilitamos)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `salario`;
DROP TABLE IF EXISTS `asistencia`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- MODIFICAR TABLA EMPLEADO
-- ==========================================

-- Agregar nuevos campos a la tabla empleado
ALTER TABLE `empleado`
  ADD COLUMN `telefono` VARCHAR(20) DEFAULT NULL AFTER `funcion`,
  ADD COLUMN `dni` VARCHAR(15) DEFAULT NULL AFTER `telefono`,
  ADD COLUMN `direccion` TEXT DEFAULT NULL AFTER `dni`,
  ADD COLUMN `salario_base` DECIMAL(10,2) DEFAULT 0.00 AFTER `direccion`,
  ADD COLUMN `fecha_ingreso` DATE DEFAULT NULL AFTER `salario_base`,
  ADD COLUMN `activo` TINYINT(1) DEFAULT 1 AFTER `fecha_ingreso`,
  ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `activo`;

-- Agregar índice único para DNI
ALTER TABLE `empleado` ADD UNIQUE KEY `uk_dni` (`dni`);

-- ==========================================
-- NUEVA TABLA: ASISTENCIA
-- ==========================================

CREATE TABLE `asistencia` (
  `id_asistencia` INT NOT NULL AUTO_INCREMENT,
  `id_empleado` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `presente` TINYINT(1) NOT NULL DEFAULT 1,
  `es_sabado` TINYINT(1) NOT NULL DEFAULT 0,
  `horas_extra` DECIMAL(4,2) DEFAULT 0.00,
  `justificada` TINYINT(1) DEFAULT NULL COMMENT 'NULL si presente=1, TRUE/FALSE si presente=0',
  `motivo` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uk_empleado_fecha` (`id_empleado`, `fecha`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_empleado` (`id_empleado`),
  CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- NUEVA TABLA: RECIBO DE SUELDO
-- ==========================================

CREATE TABLE `recibo_sueldo` (
  `id_recibo` INT NOT NULL AUTO_INCREMENT,
  `id_empleado` INT NOT NULL,
  `periodo_quincena` TINYINT(1) NOT NULL COMMENT '1 = primera quincena, 2 = segunda quincena',
  `periodo_mes` TINYINT NOT NULL,
  `periodo_anio` SMALLINT NOT NULL,
  `fecha_desde` DATE NOT NULL,
  `fecha_hasta` DATE NOT NULL,
  
  -- Conceptos de haberes
  `salario_base` DECIMAL(10,2) NOT NULL,
  `presentismo` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '9% del salario base si corresponde',
  `horas_extra_monto` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `bonificaciones` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Conceptos de descuentos
  `descuento_ausencias` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `otros_descuentos` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Totales
  `total_haberes` DECIMAL(10,2) NOT NULL,
  `total_descuentos` DECIMAL(10,2) NOT NULL,
  `total_neto` DECIMAL(10,2) NOT NULL,
  
  -- Estadísticas del período
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `dias_ausentes_justificados` INT NOT NULL DEFAULT 0,
  `dias_ausentes_injustificados` INT NOT NULL DEFAULT 0,
  `total_horas_extra` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  
  -- Metadatos
  `observaciones` TEXT DEFAULT NULL,
  `generado_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id_recibo`),
  UNIQUE KEY `uk_recibo_periodo` (`id_empleado`, `periodo_quincena`, `periodo_mes`, `periodo_anio`),
  KEY `idx_periodo` (`periodo_anio`, `periodo_mes`, `periodo_quincena`),
  CONSTRAINT `recibo_sueldo_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- TABLA: CONFIGURACIÓN DE NÓMINA
-- ==========================================

CREATE TABLE `config_nomina` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(50) NOT NULL,
  `valor` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insertar configuraciones por defecto
INSERT INTO `config_nomina` (`clave`, `valor`, `descripcion`) VALUES
('porcentaje_presentismo', '9', 'Porcentaje de presentismo sobre salario base'),
('max_faltas_justificadas_presentismo', '3', 'Máximo de faltas justificadas para mantener presentismo'),
('porcentaje_hora_extra_sabado', '50', 'Porcentaje adicional por hora extra en sábado'),
('valor_hora_extra_base', '1.5', 'Multiplicador del valor hora para horas extra normales');

-- ==========================================
-- VISTA: RESUMEN ASISTENCIA POR EMPLEADO
-- ==========================================

CREATE OR REPLACE VIEW `v_resumen_asistencia` AS
SELECT 
  e.id_empleado,
  e.nombre,
  e.apellido,
  e.dni,
  e.salario_base,
  YEAR(a.fecha) AS anio,
  MONTH(a.fecha) AS mes,
  SUM(CASE WHEN a.presente = 1 THEN 1 ELSE 0 END) AS dias_presentes,
  SUM(CASE WHEN a.presente = 0 AND a.justificada = 1 THEN 1 ELSE 0 END) AS ausencias_justificadas,
  SUM(CASE WHEN a.presente = 0 AND a.justificada = 0 THEN 1 ELSE 0 END) AS ausencias_injustificadas,
  SUM(COALESCE(a.horas_extra, 0)) AS total_horas_extra,
  SUM(CASE WHEN a.es_sabado = 1 AND a.presente = 1 THEN 1 ELSE 0 END) AS sabados_trabajados
FROM empleado e
LEFT JOIN asistencia a ON a.id_empleado = e.id_empleado
WHERE e.activo = 1
GROUP BY e.id_empleado, e.nombre, e.apellido, e.dni, e.salario_base, YEAR(a.fecha), MONTH(a.fecha);

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================
