-- ==========================================
-- ELECTROTECH - BASE DE DATOS COMPLETA
-- ==========================================
-- Script unificado con:
--   1. Schema (tablas, triggers, vistas)
--   2. Sistema RBAC (módulos, formularios, componentes, permisos)
--   3. Sistema de Auditoría (sesiones y trazabilidad)
-- Fecha: 2025-12-13
-- ==========================================

CREATE DATABASE IF NOT EXISTS electrotech2;
USE electrotech2;

-- ==========================================
-- PARTE 1: SISTEMA RBAC - TABLAS BASE
-- ==========================================

CREATE TABLE `modulo` (
  `id_modulo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `icono` VARCHAR(50) DEFAULT NULL,
  `orden` INT DEFAULT 0,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_modulo`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `formulario` (
  `id_formulario` INT NOT NULL AUTO_INCREMENT,
  `id_modulo` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `ruta` VARCHAR(200) NOT NULL,
  `descripcion` TEXT,
  `icono` VARCHAR(50) DEFAULT NULL,
  `orden` INT DEFAULT 0,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_formulario`),
  UNIQUE KEY `ruta` (`ruta`),
  KEY `id_modulo` (`id_modulo`),
  CONSTRAINT `formulario_ibfk_1` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `componente` (
  `id_componente` INT NOT NULL AUTO_INCREMENT,
  `id_formulario` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `tipo` ENUM('boton','tabla','formulario','seccion','acceso','otro') DEFAULT 'otro',
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_componente`),
  UNIQUE KEY `uk_componente` (`id_formulario`,`nombre`),
  CONSTRAINT `componente_ibfk_1` FOREIGN KEY (`id_formulario`) REFERENCES `formulario` (`id_formulario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `accion` (
  `id_accion` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_accion`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `estadogrupo` (
  `id_estado` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `grupo` (
  `id_grupo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `id_estado` INT DEFAULT 1,
  PRIMARY KEY (`id_grupo`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `grupo_ibfk_1` FOREIGN KEY (`id_estado`) REFERENCES `estadogrupo` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- PARTE 2: USUARIOS Y AUTENTICACIÓN
-- ==========================================

CREATE TABLE `usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('ADMIN','OPERARIO','GERENTE') DEFAULT 'OPERARIO',
  `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `resetpasswordtoken` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(150) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `auditoriasesion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `fecha_hora_login` DATETIME NOT NULL,
  `fecha_hora_logout` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_login` (`fecha_hora_login`),
  KEY `idx_logout` (`fecha_hora_logout`),
  CONSTRAINT `auditoriasesion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- PARTE 3: SISTEMA DE AUDITORÍA Y TRAZABILIDAD
-- ==========================================

CREATE TABLE `auditoriatrazabilidad` (
  `id_auditoria` INT NOT NULL AUTO_INCREMENT,
  `tabla_afectada` VARCHAR(100) NOT NULL,
  `id_registro` INT NOT NULL,
  `accion` ENUM('INSERT','UPDATE','DELETE','FACTURADO') NOT NULL,
  `datos_anteriores` JSON,
  `datos_nuevos` JSON,
  `usuario_sistema` VARCHAR(100),
  `id_usuario` INT NULL,
  `fecha_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_tabla` (`tabla_afectada`),
  KEY `idx_accion` (`accion`),
  KEY `idx_fecha` (`fecha_hora`),
  KEY `idx_registro` (`tabla_afectada`, `id_registro`),
  KEY `idx_usuario` (`id_usuario`),
  CONSTRAINT `auditoriatrazabilidad_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- PARTE 4: RELACIONES RBAC
-- ==========================================

CREATE TABLE `grupousuario` (
  `id_grupo` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_grupo`,`id_usuario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `grupousuario_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`),
  CONSTRAINT `grupousuario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `grupocomponente` (
  `id_grupo` INT NOT NULL,
  `id_componente` INT NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_grupo`,`id_componente`),
  KEY `id_componente` (`id_componente`),
  CONSTRAINT `grupocomponente_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`) ON DELETE CASCADE,
  CONSTRAINT `grupocomponente_ibfk_2` FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `grupocomponenteaccion` (
  `id_grupo` INT NOT NULL,
  `id_componente` INT NOT NULL,
  `id_accion` INT NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_grupo`,`id_componente`,`id_accion`),
  KEY `id_componente` (`id_componente`),
  KEY `id_accion` (`id_accion`),
  CONSTRAINT `grupocomponenteaccion_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`) ON DELETE CASCADE,
  CONSTRAINT `grupocomponenteaccion_ibfk_2` FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE,
  CONSTRAINT `grupocomponenteaccion_ibfk_3` FOREIGN KEY (`id_accion`) REFERENCES `accion` (`id_accion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- PARTE 5: CORE 1 - CLIENTES, PIEZAS Y PINTURAS
-- ==========================================

CREATE TABLE `cliente` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `pieza` (
  `id_pieza` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `ancho_m` DECIMAL(10,2) NOT NULL,
  `alto_m` DECIMAL(10,2) NOT NULL,
  `detalle` VARCHAR(255) DEFAULT NULL,
  `habilitada` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_pieza`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `pieza_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `stockpieza` (
  `id_pieza` INT NOT NULL,
  `total_recibida` INT NOT NULL DEFAULT 0,
  `total_pintada` INT NOT NULL DEFAULT 0,
  `stock_disponible` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_pieza`),
  CONSTRAINT `stockpieza_ibfk_1` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `proveedor` (
  `id_proveedor` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `marca` (
  `id_marca` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `color` (
  `id_color` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_color`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tipopintura` (
  `id_tipo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `pintura` (
  `id_pintura` INT NOT NULL AUTO_INCREMENT,
  `id_marca` INT NOT NULL,
  `id_color` INT NOT NULL,
  `id_tipo` INT NOT NULL,
  `id_proveedor` INT NOT NULL,
  `cantidad_kg` DECIMAL(10,2) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `habilitada` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_pintura`),
  KEY `id_marca` (`id_marca`),
  KEY `id_color` (`id_color`),
  KEY `id_tipo` (`id_tipo`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `pintura_ibfk_1` FOREIGN KEY (`id_marca`) REFERENCES `marca` (`id_marca`),
  CONSTRAINT `pintura_ibfk_2` FOREIGN KEY (`id_color`) REFERENCES `color` (`id_color`),
  CONSTRAINT `pintura_ibfk_3` FOREIGN KEY (`id_tipo`) REFERENCES `tipopintura` (`id_tipo`),
  CONSTRAINT `pintura_ibfk_4` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `proveedorpintura` (
  `id_proveedor` INT NOT NULL,
  `id_pintura` INT NOT NULL,
  PRIMARY KEY (`id_proveedor`,`id_pintura`),
  KEY `id_pintura` (`id_pintura`),
  CONSTRAINT `proveedorpintura_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `proveedorpintura_ibfk_2` FOREIGN KEY (`id_pintura`) REFERENCES `pintura` (`id_pintura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `piezapintada` (
  `id_pieza_pintada` INT NOT NULL AUTO_INCREMENT,
  `id_pieza` INT NOT NULL,
  `id_pintura` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `cantidad_facturada` INT NOT NULL DEFAULT 0,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `consumo_estimado_kg` DECIMAL(10,3) NOT NULL,
  PRIMARY KEY (`id_pieza_pintada`),
  KEY `id_pieza` (`id_pieza`),
  KEY `id_pintura` (`id_pintura`),
  CONSTRAINT `piezapintada_ibfk_1` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`),
  CONSTRAINT `piezapintada_ibfk_2` FOREIGN KEY (`id_pintura`) REFERENCES `pintura` (`id_pintura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- PARTE 6: CORE 2 - REMITOS Y FACTURAS
-- ==========================================

CREATE TABLE `remito` (
  `id_remito` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `fecha_recepcion` DATETIME NOT NULL,
  `cantidad_piezas` INT NOT NULL,
  PRIMARY KEY (`id_remito`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `remito_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `remitodetalle` (
  `id_detalle` INT NOT NULL AUTO_INCREMENT,
  `id_remito` INT NOT NULL,
  `id_pieza` INT NOT NULL,
  `cantidad` INT NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_remito` (`id_remito`),
  KEY `id_pieza` (`id_pieza`),
  CONSTRAINT `remitodetalle_ibfk_1` FOREIGN KEY (`id_remito`) REFERENCES `remito` (`id_remito`),
  CONSTRAINT `remitodetalle_ibfk_2` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `factura` (
  `id_factura` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `fecha` DATETIME NOT NULL,
  `total` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `facturadetalle` (
  `id_detalle` INT NOT NULL AUTO_INCREMENT,
  `id_factura` INT NOT NULL,
  `id_pieza_pintada` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_factura` (`id_factura`),
  KEY `id_pieza_pintada` (`id_pieza_pintada`),
  CONSTRAINT `facturadetalle_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`),
  CONSTRAINT `facturadetalle_ibfk_2` FOREIGN KEY (`id_pieza_pintada`) REFERENCES `piezapintada` (`id_pieza_pintada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- PARTE 7: CORE 4 - EMPLEADOS Y MAQUINARIAS
-- ==========================================

CREATE TABLE `empleado` (
  `id_empleado` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `funcion` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `asistencia` (
  `id_empleado` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `justificacion` VARCHAR(255) DEFAULT NULL,
  `es_justificada` TINYINT(1) NOT NULL,
  `presente` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id_empleado`,`fecha`),
  CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `salario` (
  `id_salario` INT NOT NULL AUTO_INCREMENT,
  `id_empleado` INT NOT NULL,
  `salario_base` DECIMAL(10,2) NOT NULL,
  `plus_presentismo` DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id_salario`),
  KEY `id_empleado` (`id_empleado`),
  CONSTRAINT `salario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `maquinaria` (
  `id_maquinaria` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(150) DEFAULT NULL,
  `horas_uso` DECIMAL(10,2) DEFAULT 0.00,
  `max_piezas_diarias` INT NOT NULL,
  PRIMARY KEY (`id_maquinaria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `maquinariahistorial` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_maquinaria` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `piezas_pintadas` INT NOT NULL,
  `id_pieza` INT DEFAULT NULL,
  `id_pintura` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_maquinaria` (`id_maquinaria`),
  KEY `id_pieza` (`id_pieza`),
  KEY `id_pintura` (`id_pintura`),
  CONSTRAINT `maquinariahistorial_ibfk_1` FOREIGN KEY (`id_maquinaria`) REFERENCES `maquinaria` (`id_maquinaria`),
  CONSTRAINT `maquinariahistorial_ibfk_2` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`),
  CONSTRAINT `maquinariahistorial_ibfk_3` FOREIGN KEY (`id_pintura`) REFERENCES `pintura` (`id_pintura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `alertasmaquinaria` (
  `id_alerta` INT NOT NULL AUTO_INCREMENT,
  `tipo_equipo` ENUM('cabina', 'pistola', 'horno') NOT NULL,
  `id_equipo` INT NOT NULL,
  `tipo_alerta` ENUM('limite_diario', 'mantenimiento', 'temperatura', 'gas') NOT NULL,
  `mensaje` VARCHAR(255) NOT NULL,
  `nivel` ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_alerta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `politica_backup` (
  `id_politica` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `tipo` ENUM('completo', 'parcial', 'incremental') NOT NULL DEFAULT 'completo',
  `tablas_seleccionadas` TEXT NULL COMMENT 'Lista de tablas separadas por coma para backup parcial',
  `frecuencia` ENUM('diario', 'semanal', 'mensual', 'unico') NOT NULL DEFAULT 'diario',
  `hora_ejecucion` TIME NOT NULL DEFAULT '02:00:00',
  `dia_semana` TINYINT NULL COMMENT '0=Domingo, 1=Lunes, ..., 6=Sábado (para frecuencia semanal)',
  `dia_mes` TINYINT NULL COMMENT 'Día del mes 1-28 (para frecuencia mensual)',
  `activa` BOOLEAN NOT NULL DEFAULT TRUE,
  `ultima_ejecucion` DATETIME NULL,
  `proxima_ejecucion` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_politica`),
  KEY `idx_activa` (`activa`),
  KEY `idx_frecuencia` (`frecuencia`),
  KEY `idx_proxima_ejecucion` (`proxima_ejecucion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `historial_backup` (
  `id_historial` INT NOT NULL AUTO_INCREMENT,
  `id_politica` INT NOT NULL,
  `fecha_inicio` DATETIME NOT NULL,
  `fecha_fin` DATETIME NULL,
  `estado` ENUM('en_progreso', 'completado', 'fallido') NOT NULL DEFAULT 'en_progreso',
  `archivo_generado` VARCHAR(255) NULL,
  `tamano_bytes` BIGINT NULL,
  `tablas_respaldadas` TEXT NULL,
  `mensaje_error` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `idx_politica` (`id_politica`),
  KEY `idx_fecha` (`fecha_inicio`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `historial_backup_ibfk_1` FOREIGN KEY (`id_politica`) REFERENCES `politica_backup` (`id_politica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- PARTE 8: TRIGGERS
-- ==========================================

DELIMITER $$
CREATE TRIGGER `trg_remitodetalle_ai_stock` 
AFTER INSERT ON `remitodetalle` 
FOR EACH ROW 
BEGIN
  INSERT INTO StockPieza (id_pieza, total_recibida, stock_disponible)
  VALUES (NEW.id_pieza, NEW.cantidad, NEW.cantidad)
  ON DUPLICATE KEY UPDATE
    total_recibida   = total_recibida   + NEW.cantidad,
    stock_disponible = stock_disponible + NEW.cantidad;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_piezapintada_bi_stock` 
BEFORE INSERT ON `piezapintada` 
FOR EACH ROW 
BEGIN
  DECLARE v_stock INT;

  SELECT stock_disponible
    INTO v_stock
    FROM StockPieza
   WHERE id_pieza = NEW.id_pieza
   FOR UPDATE;

  IF v_stock IS NULL OR v_stock < NEW.cantidad THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Stock insuficiente para pintar la cantidad solicitada';
  ELSE
    UPDATE StockPieza
       SET total_pintada    = total_pintada + NEW.cantidad,
           stock_disponible = stock_disponible - NEW.cantidad
     WHERE id_pieza = NEW.id_pieza;
  END IF;
END$$
DELIMITER ;

-- ==========================================
-- PARTE 9: VISTAS
-- ==========================================

CREATE VIEW `v_estructura_permisos` AS
SELECT 
  m.id_modulo,
  m.nombre AS modulo,
  f.id_formulario,
  f.nombre AS formulario,
  f.ruta,
  c.id_componente,
  c.nombre AS componente,
  c.tipo AS tipo_componente
FROM modulo m
JOIN formulario f ON f.id_modulo = m.id_modulo
JOIN componente c ON c.id_formulario = f.id_formulario
WHERE m.activo = TRUE 
  AND f.activo = TRUE 
  AND c.activo = TRUE
ORDER BY m.orden, f.orden, c.id_componente;

CREATE VIEW `v_permisos_grupo` AS
SELECT 
  g.id_grupo,
  g.nombre AS grupo,
  m.nombre AS modulo,
  f.nombre AS formulario,
  f.ruta,
  c.nombre AS componente,
  gc.fecha_asignacion
FROM grupo g
JOIN grupocomponente gc ON gc.id_grupo = g.id_grupo
JOIN componente c ON c.id_componente = gc.id_componente
JOIN formulario f ON f.id_formulario = c.id_formulario
JOIN modulo m ON m.id_modulo = f.id_modulo
ORDER BY g.nombre, m.orden, f.orden;

-- ==========================================
-- PARTE 10: DATOS INICIALES - RBAC
-- ==========================================

SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO EstadoGrupo (id_estado, nombre) VALUES
(1, 'Activo'),
(2, 'Inactivo')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO Grupo (id_grupo, nombre, id_estado) VALUES
(1, 'Admin', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO Modulo (id_modulo, nombre, descripcion, icono, orden, activo) VALUES
(1, 'Piezas y Pinturas', 'Gestión de piezas, pinturas y producción', 'package', 1, 1),
(2, 'Facturación', 'Facturas, remitos y clientes', 'receipt', 2, 1),
(3, 'Reportes', 'Reportes y estadísticas del sistema', 'chart-bar', 3, 1),
(4, 'Administración', 'Configuración y permisos', 'settings', 4, 1),
(5, 'Empleados y Nómina', 'Gestión de empleados, asistencia y recibos de sueldo', 'users', 5, 1),
(6, 'Maquinarias', 'Gestión de cabinas, pistolas y hornos', 'settings-2', 6, 1),
(7, 'Base de Datos', 'Gestión de backups y mantenimiento de BD', 'database', 7, 1)
ON DUPLICATE KEY UPDATE 
  nombre=VALUES(nombre), descripcion=VALUES(descripcion), icono=VALUES(icono), orden=VALUES(orden);

INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(1, 1, 'Gestión de Piezas', '/piezas', 1),
(2, 1, 'Gestión de Pinturas', '/pinturas', 2),
(3, 1, 'Piezas Pintadas', '/piezas-pintadas', 3),
(4, 1, 'Calculadora de Consumo', '/pinturas/calculadora', 4),
(5, 2, 'Remitos', '/remitos', 1),
(6, 2, 'Facturación', '/facturacion', 2),
(7, 2, 'Clientes', '/clientes', 3),
(15, 3, 'Reportes Ventas Principal', '/reportes/ventas', 1),
(28, 3, 'Participación Clientes', '/reportes/ventas/clientes', 2),
(29, 3, 'Pintura Más Utilizada', '/reportes/ventas/pintura-mas-utilizada', 3),
(30, 3, 'Ventas por Cliente', '/reportes/ventas/ventas-por-cliente', 4),
(31, 3, 'Evolución de Ventas', '/reportes/ventas/evolucion-ventas', 5),
(32, 3, 'Consumo Pintura por Mes', '/reportes/ventas/pintura-por-mes', 6),
(33, 3, 'Ventas Cliente Específico', '/reportes/ventas/ventas-cliente-especifico', 7),
(14, 4, 'Usuarios', '/dashboard/usuarios', 1),
(16, 5, 'Gestión de Empleados', '/dashboard/empleados', 1),
(17, 5, 'Asistencia Empleado', '/dashboard/empleados/[id]/asistencia', 2),
(18, 5, 'Recibos Empleado', '/dashboard/empleados/[id]/recibos', 3),
(19, 5, 'Gestión de Recibos', '/dashboard/recibos', 4),
(20, 6, 'Gestión de Maquinarias', '/dashboard/maquinarias', 1),
(21, 6, 'Reportes Maquinarias Principal', '/reportes/maquinarias', 2),
(22, 6, 'Reporte Uso Cabinas', '/reportes/maquinarias/uso-cabinas', 3),
(23, 6, 'Reporte Productividad Diaria', '/reportes/maquinarias/productividad-diaria', 4),
(24, 6, 'Reporte Mantenimiento Pistolas', '/reportes/maquinarias/mantenimiento-pistolas', 5),
(25, 6, 'Reporte Mantenimiento Hornos', '/reportes/maquinarias/mantenimiento-hornos', 6),
(26, 6, 'Reporte Consumo Gas', '/reportes/maquinarias/consumo-gas', 7),
(40, 7, 'Panel Base de Datos', '/dashboard/base-datos', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(1, 1, 'Formulario Nueva Pieza', 'formulario'),
(2, 1, 'Tabla Listado Piezas', 'tabla'),
(3, 1, 'Botón Editar Pieza', 'boton'),
(4, 1, 'Botón Eliminar Pieza', 'boton'),
(5, 2, 'Formulario Nueva Pintura', 'formulario'),
(6, 2, 'Tabla Listado Pinturas', 'tabla'),
(7, 2, 'Botón Eliminar Pintura', 'boton'),
(24, 2, 'Botón Editar Pintura', 'boton'),
(8, 3, 'Formulario Registrar Producción', 'formulario'),
(9, 3, 'Tabla Historial Producción', 'tabla'),
(23, 3, 'Botón Eliminar Pieza Pintada', 'boton'),
(10, 5, 'Formulario Cargar Remito', 'formulario'),
(11, 5, 'Tabla Listado Remitos', 'tabla'),
(12, 5, 'Botón Ver Detalle', 'boton'),
(13, 5, 'Botón Imprimir PDF', 'boton'),
(14, 6, 'Formulario Generar Factura', 'formulario'),
(15, 6, 'Tabla Listado Facturas', 'tabla'),
(16, 6, 'Botón Ver Detalle Factura', 'boton'),
(17, 6, 'Botón Imprimir Factura', 'boton'),
(115, 15, 'Página Principal Reportes Ventas', 'acceso'),
(116, 28, 'Acceso Participación Clientes', 'acceso'),
(117, 29, 'Acceso Pintura Más Utilizada', 'acceso'),
(118, 30, 'Acceso Ventas por Cliente', 'acceso'),
(119, 31, 'Acceso Evolución de Ventas', 'acceso'),
(120, 32, 'Acceso Consumo Pintura por Mes', 'acceso'),
(121, 33, 'Acceso Ventas Cliente Específico', 'acceso'),
(70, 16, 'Acceso Gestión Empleados', 'acceso'),
(71, 16, 'Formulario Nuevo Empleado', 'formulario'),
(72, 16, 'Tabla Listado Empleados', 'tabla'),
(73, 16, 'Botón Editar Empleado', 'boton'),
(74, 16, 'Botón Desactivar Empleado', 'boton'),
(75, 16, 'Botón Ver Asistencia', 'boton'),
(76, 16, 'Botón Ver Recibos', 'boton'),
(77, 17, 'Acceso Asistencia Empleado', 'acceso'),
(78, 17, 'Calendario Asistencia', 'otro'),
(79, 17, 'Botón Auto-cargar Asistencias', 'boton'),
(80, 17, 'Formulario Registrar Asistencia', 'formulario'),
(81, 18, 'Acceso Recibos Empleado', 'acceso'),
(82, 18, 'Tabla Historial Recibos', 'tabla'),
(83, 18, 'Botón Generar Recibo', 'boton'),
(84, 18, 'Botón Ver Detalle Recibo', 'boton'),
(85, 18, 'Botón Descargar PDF', 'boton'),
(86, 19, 'Acceso Gestión Recibos', 'acceso'),
(87, 19, 'Tabla Todos los Recibos', 'tabla'),
(88, 19, 'Botón Generar Recibos Masivo', 'boton'),
(89, 19, 'Botón Ver Recibo Individual', 'boton'),
(90, 20, 'Acceso Gestión Maquinarias', 'acceso'),
(91, 20, 'Tab Cabinas', 'seccion'),
(92, 20, 'Tab Pistolas', 'seccion'),
(93, 20, 'Tab Hornos', 'seccion'),
(94, 20, 'Ver Cards Cabinas', 'otro'),
(95, 20, 'Ver Cards Pistolas', 'otro'),
(96, 20, 'Ver Cards Hornos', 'otro'),
(97, 20, 'Formulario Nueva Cabina', 'formulario'),
(98, 20, 'Formulario Nueva Pistola', 'formulario'),
(99, 20, 'Formulario Nuevo Horno', 'formulario'),
(100, 20, 'Botón Editar Cabina', 'boton'),
(101, 20, 'Botón Editar Pistola', 'boton'),
(102, 20, 'Botón Editar Horno', 'boton'),
(103, 20, 'Botón Eliminar Cabina', 'boton'),
(104, 20, 'Botón Eliminar Pistola', 'boton'),
(105, 20, 'Botón Eliminar Horno', 'boton'),
(106, 20, 'Botón Registrar Mantenimiento Pistola', 'boton'),
(107, 20, 'Botón Registrar Mantenimiento Horno', 'boton'),
(108, 21, 'Acceso Reportes Maquinarias', 'acceso'),
(109, 22, 'Acceso Reporte Uso Cabinas', 'acceso'),
(110, 23, 'Acceso Reporte Productividad Diaria', 'acceso'),
(111, 24, 'Acceso Reporte Mantenimiento Pistolas', 'acceso'),
(112, 25, 'Acceso Reporte Mantenimiento Hornos', 'acceso'),
(113, 26, 'Acceso Reporte Consumo Gas', 'acceso'),
(130, 40, 'Acceso Panel Base de Datos', 'acceso'),
(131, 40, 'Botón Nueva Política', 'boton'),
(132, 40, 'Ver Tabla Políticas', 'tabla'),
(133, 40, 'Botón Ejecutar Backup', 'boton'),
(134, 40, 'Botón Activar/Desactivar Política', 'boton'),
(135, 40, 'Botón Eliminar Política', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente)
SELECT 1, id_componente FROM Componente;

INSERT INTO politica_backup (nombre, tipo, frecuencia, hora_ejecucion, dia_semana, dia_mes, activa) VALUES
('Backup Completo Semanal', 'completo', 'semanal', '03:00:00', 0, NULL, TRUE),
('Backup Diario Incremental', 'incremental', 'diario', '02:00:00', NULL, NULL, TRUE)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================

SELECT 
    '✅ Base de datos ELECTROTECH instalada correctamente' AS Status,
    (SELECT COUNT(*) FROM Modulo) AS Modulos,
    (SELECT COUNT(*) FROM Formulario) AS Formularios,
    (SELECT COUNT(*) FROM Componente) AS Componentes,
    (SELECT COUNT(*) FROM GrupoComponente WHERE id_grupo = 1) AS Permisos_Admin;
