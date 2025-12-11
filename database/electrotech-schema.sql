-- ==========================================
-- ELECTROTECH - DATABASE SCHEMA
-- ==========================================
-- Complete database creation script
-- Date: 2025-11-25
-- ==========================================

-- Create database
CREATE DATABASE IF NOT EXISTS electrotech2;
USE electrotech2;

-- ==========================================
-- SISTEMA RBAC - TABLAS BASE
-- ==========================================

-- Tabla: Modulo
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

-- Tabla: Formulario
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

-- Tabla: Componente
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

-- Tabla: Accion
CREATE TABLE `accion` (
  `id_accion` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_accion`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: EstadoGrupo
CREATE TABLE `estadogrupo` (
  `id_estado` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Grupo
CREATE TABLE `grupo` (
  `id_grupo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `id_estado` INT DEFAULT 1,
  PRIMARY KEY (`id_grupo`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `grupo_ibfk_1` FOREIGN KEY (`id_estado`) REFERENCES `estadogrupo` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- USUARIOS Y AUTENTICACIÓN
-- ==========================================

-- Tabla: Usuario
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

-- Tabla: ResetPasswordToken
CREATE TABLE `resetpasswordtoken` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(150) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: AuditoriaSesion
CREATE TABLE `auditoriasesion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `fecha_hora_login` DATETIME NOT NULL,
  `fecha_hora_logout` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `auditoriasesion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ==========================================
-- RELACIONES RBAC
-- ==========================================

-- Tabla: GrupoUsuario
CREATE TABLE `grupousuario` (
  `id_grupo` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_grupo`,`id_usuario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `grupousuario_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`),
  CONSTRAINT `grupousuario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: GrupoComponente
CREATE TABLE `grupocomponente` (
  `id_grupo` INT NOT NULL,
  `id_componente` INT NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_grupo`,`id_componente`),
  KEY `id_componente` (`id_componente`),
  CONSTRAINT `grupocomponente_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupo` (`id_grupo`) ON DELETE CASCADE,
  CONSTRAINT `grupocomponente_ibfk_2` FOREIGN KEY (`id_componente`) REFERENCES `componente` (`id_componente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: GrupoComponenteAccion
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
-- CORE 1 - CLIENTES, PIEZAS Y PINTURAS
-- ==========================================

-- Tabla: Cliente
CREATE TABLE `cliente` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Pieza
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

-- Tabla: StockPieza
CREATE TABLE `stockpieza` (
  `id_pieza` INT NOT NULL,
  `total_recibida` INT NOT NULL DEFAULT 0,
  `total_pintada` INT NOT NULL DEFAULT 0,
  `stock_disponible` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_pieza`),
  CONSTRAINT `stockpieza_ibfk_1` FOREIGN KEY (`id_pieza`) REFERENCES `pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Proveedor
CREATE TABLE `proveedor` (
  `id_proveedor` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Marca
CREATE TABLE `marca` (
  `id_marca` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Color
CREATE TABLE `color` (
  `id_color` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_color`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: TipoPintura
CREATE TABLE `tipopintura` (
  `id_tipo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Pintura
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

-- Tabla: ProveedorPintura (relación muchos a muchos)
CREATE TABLE `proveedorpintura` (
  `id_proveedor` INT NOT NULL,
  `id_pintura` INT NOT NULL,
  PRIMARY KEY (`id_proveedor`,`id_pintura`),
  KEY `id_pintura` (`id_pintura`),
  CONSTRAINT `proveedorpintura_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `proveedorpintura_ibfk_2` FOREIGN KEY (`id_pintura`) REFERENCES `pintura` (`id_pintura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: PiezaPintada
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
-- CORE 2 - REMITOS Y FACTURAS
-- ==========================================

-- Tabla: Remito
CREATE TABLE `remito` (
  `id_remito` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `fecha_recepcion` DATETIME NOT NULL,
  `cantidad_piezas` INT NOT NULL,
  PRIMARY KEY (`id_remito`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `remito_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: RemitoDetalle
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

-- Tabla: Factura
CREATE TABLE `factura` (
  `id_factura` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT NOT NULL,
  `fecha` DATETIME NOT NULL,
  `total` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: FacturaDetalle
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
-- CORE 4 - EMPLEADOS Y MAQUINARIAS
-- ==========================================

-- Tabla: Empleado
CREATE TABLE `empleado` (
  `id_empleado` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `funcion` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Asistencia
CREATE TABLE `asistencia` (
  `id_empleado` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `justificacion` VARCHAR(255) DEFAULT NULL,
  `es_justificada` TINYINT(1) NOT NULL,
  `presente` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id_empleado`,`fecha`),
  CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Salario
CREATE TABLE `salario` (
  `id_salario` INT NOT NULL AUTO_INCREMENT,
  `id_empleado` INT NOT NULL,
  `salario_base` DECIMAL(10,2) NOT NULL,
  `plus_presentismo` DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id_salario`),
  KEY `id_empleado` (`id_empleado`),
  CONSTRAINT `salario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: Maquinaria
CREATE TABLE `maquinaria` (
  `id_maquinaria` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(150) DEFAULT NULL,
  `horas_uso` DECIMAL(10,2) DEFAULT 0.00,
  `max_piezas_diarias` INT NOT NULL,
  PRIMARY KEY (`id_maquinaria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: MaquinariaHistorial
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

-- Tabla: AlertasMaquinaria
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

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger: Actualizar stock al insertar remito detalle
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

-- Trigger: Validar y actualizar stock al pintar piezas
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
-- VISTAS
-- ==========================================

-- Vista: Estructura de permisos
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

-- Vista: Permisos por grupo
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
-- FIN DEL SCHEMA
-- ==========================================
