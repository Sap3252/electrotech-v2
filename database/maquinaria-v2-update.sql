-- ==========================================
-- ELECTROTECH - MAQUINARIA V2 UPDATE
-- ==========================================
-- Nuevo modelo: Cabinas con Pistolas y Hornos
-- Relaciones muchos a muchos
-- Fecha: 2025-12-03
-- ==========================================

USE electrotech2;

SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- ELIMINAR ESTRUCTURA ANTERIOR (si existe)
-- ==========================================
DROP TABLE IF EXISTS alertasmaquinaria;
DROP TABLE IF EXISTS maquinariahistorial;
DROP TABLE IF EXISTS cabinahistorial;
DROP TABLE IF EXISTS cabinapistola;
DROP TABLE IF EXISTS cabinahorno;

-- Eliminar TODAS las FK de piezapintada que referencian a maquinaria
SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'piezapintada' 
                AND COLUMN_NAME = 'id_maquinaria'
                AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1);

SET @sql = IF(@fk_name IS NOT NULL, 
              CONCAT('ALTER TABLE piezapintada DROP FOREIGN KEY ', @fk_name), 
              'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar columna id_maquinaria si existe
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'piezapintada' 
                   AND COLUMN_NAME = 'id_maquinaria');

SET @sql = IF(@col_exists > 0, 
              'ALTER TABLE piezapintada DROP COLUMN id_maquinaria', 
              'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar FK de cabina si existe (para re-ejecutar el script)
SET @fk_cabina_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                       WHERE TABLE_SCHEMA = DATABASE() 
                       AND TABLE_NAME = 'piezapintada' 
                       AND COLUMN_NAME = 'id_cabina'
                       AND REFERENCED_TABLE_NAME IS NOT NULL
                       LIMIT 1);

SET @sql = IF(@fk_cabina_name IS NOT NULL, 
              CONCAT('ALTER TABLE piezapintada DROP FOREIGN KEY ', @fk_cabina_name), 
              'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar columna id_cabina si existe (para re-ejecutar el script)
SET @col_cabina_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                          WHERE TABLE_SCHEMA = DATABASE() 
                          AND TABLE_NAME = 'piezapintada' 
                          AND COLUMN_NAME = 'id_cabina');

SET @sql = IF(@col_cabina_exists > 0, 
              'ALTER TABLE piezapintada DROP COLUMN id_cabina', 
              'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar tablas
DROP TABLE IF EXISTS cabina;
DROP TABLE IF EXISTS pistola;
DROP TABLE IF EXISTS horno;

-- Eliminar tabla maquinaria antigua
DROP TABLE IF EXISTS maquinaria;

-- ==========================================
-- NUEVAS TABLAS
-- ==========================================

-- Tabla: Pistola (máquina de pintura)
CREATE TABLE pistola (
    id_pistola INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    horas_uso DECIMAL(10,2) DEFAULT 0,
    horas_mantenimiento DECIMAL(10,2) DEFAULT 500, -- Cada 500 horas requiere mantenimiento
    ultimo_mantenimiento DATE,
    estado ENUM('activa', 'mantenimiento', 'inactiva') DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: Horno
CREATE TABLE horno (
    id_horno INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    horas_uso DECIMAL(10,2) DEFAULT 0,
    horas_mantenimiento DECIMAL(10,2) DEFAULT 1000, -- Cada 1000 horas requiere mantenimiento
    temperatura_max DECIMAL(5,2) DEFAULT 200, -- Temperatura máxima en °C
    gasto_gas_hora DECIMAL(10,2) DEFAULT 0, -- m³/hora de gas
    ultimo_mantenimiento DATE,
    estado ENUM('activo', 'mantenimiento', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: Cabina (unidad principal de trabajo)
CREATE TABLE cabina (
    id_cabina INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    max_piezas_diarias INT DEFAULT 200,
    piezas_hoy INT DEFAULT 0,
    estado ENUM('activa', 'mantenimiento', 'inactiva') DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: Relación Cabina-Pistola (muchos a muchos)
CREATE TABLE cabinapistola (
    id_cabina INT NOT NULL,
    id_pistola INT NOT NULL,
    fecha_asignacion DATE DEFAULT (CURDATE()),
    activa BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id_cabina, id_pistola),
    FOREIGN KEY (id_cabina) REFERENCES cabina(id_cabina) ON DELETE CASCADE,
    FOREIGN KEY (id_pistola) REFERENCES pistola(id_pistola) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: Relación Cabina-Horno (muchos a muchos)
CREATE TABLE cabinahorno (
    id_cabina INT NOT NULL,
    id_horno INT NOT NULL,
    fecha_asignacion DATE DEFAULT (CURDATE()),
    activo BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id_cabina, id_horno),
    FOREIGN KEY (id_cabina) REFERENCES cabina(id_cabina) ON DELETE CASCADE,
    FOREIGN KEY (id_horno) REFERENCES horno(id_horno) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: Historial de uso de cabina
CREATE TABLE cabinahistorial (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_cabina INT NOT NULL,
    fecha DATE NOT NULL,
    piezas_pintadas INT DEFAULT 0,
    id_pieza INT,
    id_pintura INT,
    horas_trabajo DECIMAL(5,2) DEFAULT 0,
    gas_consumido DECIMAL(10,2) DEFAULT 0, -- Total gas consumido ese día
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cabina) REFERENCES cabina(id_cabina),
    FOREIGN KEY (id_pieza) REFERENCES pieza(id_pieza),
    FOREIGN KEY (id_pintura) REFERENCES pintura(id_pintura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla: Alertas de maquinaria (cabinas, pistolas, hornos)
CREATE TABLE alertasmaquinaria (
    id_alerta INT AUTO_INCREMENT PRIMARY KEY,
    tipo_equipo ENUM('cabina', 'pistola', 'horno') NOT NULL,
    id_equipo INT NOT NULL, -- ID del equipo según tipo
    tipo_alerta ENUM('limite_diario', 'mantenimiento', 'temperatura', 'gas') NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    nivel ENUM('info', 'warning', 'critical') DEFAULT 'info',
    leida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Agregar columna id_cabina a piezapintada
ALTER TABLE piezapintada 
ADD COLUMN id_cabina INT NULL AFTER id_pintura,
ADD CONSTRAINT piezapintada_ibfk_cabina 
    FOREIGN KEY (id_cabina) REFERENCES cabina(id_cabina);

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Eliminar trigger si existe (para poder re-ejecutar el script)
DROP TRIGGER IF EXISTS after_piezapintada_insert_cabina;

-- Trigger: Reset contador diario de cabinas a medianoche (ejecutar manualmente o con evento)
DELIMITER //

-- Trigger: Actualizar contador de cabina y horas de uso
CREATE TRIGGER after_piezapintada_insert_cabina
AFTER INSERT ON piezapintada
FOR EACH ROW
BEGIN
    DECLARE v_horas DECIMAL(5,2);
    
    IF NEW.id_cabina IS NOT NULL THEN
        -- Calcular horas aproximadas (1 pieza = 0.1 horas promedio)
        SET v_horas = NEW.cantidad * 0.1;
        
        -- Actualizar contador de cabina
        UPDATE cabina 
        SET piezas_hoy = piezas_hoy + NEW.cantidad 
        WHERE id_cabina = NEW.id_cabina;
        
        -- Actualizar horas de uso de pistolas asignadas
        UPDATE pistola p
        INNER JOIN cabinapistola cp ON p.id_pistola = cp.id_pistola
        SET p.horas_uso = p.horas_uso + v_horas
        WHERE cp.id_cabina = NEW.id_cabina AND cp.activa = TRUE;
        
        -- Actualizar horas de uso de hornos asignados
        UPDATE horno h
        INNER JOIN cabinahorno ch ON h.id_horno = ch.id_horno
        SET h.horas_uso = h.horas_uso + v_horas
        WHERE ch.id_cabina = NEW.id_cabina AND ch.activo = TRUE;
        
        -- Insertar en historial
        INSERT INTO cabinahistorial (id_cabina, fecha, piezas_pintadas, id_pieza, id_pintura, horas_trabajo)
        VALUES (NEW.id_cabina, NEW.fecha, NEW.cantidad, NEW.id_pieza, NEW.id_pintura, v_horas);
    END IF;
END//

DELIMITER ;

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista: Estado completo de cabinas con sus equipos
CREATE OR REPLACE VIEW v_cabinas_completas AS
SELECT 
    c.id_cabina,
    c.nombre AS cabina,
    c.estado AS estado_cabina,
    c.max_piezas_diarias,
    c.piezas_hoy,
    ROUND((c.piezas_hoy / c.max_piezas_diarias) * 100, 1) AS porcentaje_uso,
    GROUP_CONCAT(DISTINCT p.nombre ORDER BY p.nombre SEPARATOR ', ') AS pistolas,
    GROUP_CONCAT(DISTINCT h.nombre ORDER BY h.nombre SEPARATOR ', ') AS hornos
FROM cabina c
LEFT JOIN cabinapistola cp ON c.id_cabina = cp.id_cabina AND cp.activa = TRUE
LEFT JOIN pistola p ON cp.id_pistola = p.id_pistola
LEFT JOIN cabinahorno ch ON c.id_cabina = ch.id_cabina AND ch.activo = TRUE
LEFT JOIN horno h ON ch.id_horno = h.id_horno
GROUP BY c.id_cabina;

-- Vista: Pistolas que necesitan mantenimiento
CREATE OR REPLACE VIEW v_pistolas_mantenimiento AS
SELECT 
    p.*,
    ROUND((p.horas_uso / p.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento,
    CASE 
        WHEN p.horas_uso >= p.horas_mantenimiento THEN 'URGENTE'
        WHEN p.horas_uso >= p.horas_mantenimiento * 0.9 THEN 'PRONTO'
        ELSE 'OK'
    END AS alerta_mantenimiento
FROM pistola p;

-- Vista: Hornos que necesitan mantenimiento
CREATE OR REPLACE VIEW v_hornos_mantenimiento AS
SELECT 
    h.*,
    ROUND((h.horas_uso / h.horas_mantenimiento) * 100, 1) AS porcentaje_mantenimiento,
    CASE 
        WHEN h.horas_uso >= h.horas_mantenimiento THEN 'URGENTE'
        WHEN h.horas_uso >= h.horas_mantenimiento * 0.9 THEN 'PRONTO'
        ELSE 'OK'
    END AS alerta_mantenimiento
FROM horno h;

-- ==========================================
-- PROCEDIMIENTO: Reset diario de contadores
-- ==========================================
DROP PROCEDURE IF EXISTS sp_reset_contadores_diarios;

DELIMITER //

CREATE PROCEDURE sp_reset_contadores_diarios()
BEGIN
    UPDATE cabina SET piezas_hoy = 0;
END//

DELIMITER ;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================
SELECT 'Maquinaria V2 - Schema actualizado correctamente' AS status;
SELECT 'Tablas creadas: cabina, pistola, horno, cabinapistola, cabinahorno, cabinahistorial, alertasmaquinaria' AS tablas;
