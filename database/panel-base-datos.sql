-- ================================================
-- MIGRACIÓN: Panel de Base de Datos - Políticas de Backup
-- ================================================

-- Tabla para almacenar políticas de backup
CREATE TABLE IF NOT EXISTS politica_backup (
    id_politica INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('completo', 'parcial', 'incremental') NOT NULL DEFAULT 'completo',
    tablas_seleccionadas TEXT NULL COMMENT 'Lista de tablas separadas por coma para backup parcial',
    frecuencia ENUM('diario', 'semanal', 'mensual', 'unico') NOT NULL DEFAULT 'diario',
    hora_ejecucion TIME NOT NULL DEFAULT '02:00:00',
    dia_semana TINYINT NULL COMMENT '0=Domingo, 1=Lunes, ..., 6=Sábado (para frecuencia semanal)',
    dia_mes TINYINT NULL COMMENT 'Día del mes 1-28 (para frecuencia mensual)',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    ultima_ejecucion DATETIME NULL,
    proxima_ejecucion DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_activa (activa),
    INDEX idx_frecuencia (frecuencia),
    INDEX idx_proxima_ejecucion (proxima_ejecucion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para historial de backups ejecutados
CREATE TABLE IF NOT EXISTS historial_backup (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_politica INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NULL,
    estado ENUM('en_progreso', 'completado', 'fallido') NOT NULL DEFAULT 'en_progreso',
    archivo_generado VARCHAR(255) NULL,
    tamano_bytes BIGINT NULL,
    tablas_respaldadas TEXT NULL,
    mensaje_error TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_politica (id_politica),
    INDEX idx_fecha (fecha_inicio),
    INDEX idx_estado (estado),
    
    -- Foreign Key
    CONSTRAINT fk_historial_politica 
        FOREIGN KEY (id_politica) REFERENCES politica_backup(id_politica)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- DATOS INICIALES: Políticas de ejemplo
-- ================================================
INSERT INTO politica_backup (nombre, tipo, frecuencia, hora_ejecucion, dia_semana, dia_mes, activa) VALUES
('Backup Completo Semanal', 'completo', 'semanal', '03:00:00', 0, NULL, TRUE),
('Backup Diario Incremental', 'incremental', 'diario', '02:00:00', NULL, NULL, TRUE);

-- ================================================
-- RBAC: Módulo Panel Base de Datos
-- ================================================

-- Nuevo módulo para Base de Datos (ID 7)
INSERT INTO Modulo (id_modulo, nombre, descripcion, icono, orden, activo) VALUES
(7, 'Base de Datos', 'Gestión de backups y mantenimiento de BD', 'database', 7, 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- Formulario: Panel Base de Datos (ID 40 - seguro que no existe)
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden, icono, activo) VALUES
(40, 7, 'Panel Base de Datos', '/dashboard/base-datos', 1, 'database', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

-- Componentes del Panel Base de Datos
-- IDs: 130-135 (rango seguro sin conflictos)
INSERT INTO Componente (id_componente, id_formulario, nombre, descripcion, activo) VALUES
(130, 40, 'Acceso Panel Base de Datos', 'Permite ver el panel de gestión de backups', 1),
(131, 40, 'Botón Nueva Política', 'Permite crear nuevas políticas de backup', 1),
(132, 40, 'Ver Tabla Políticas', 'Permite ver la tabla de políticas de backup', 1),
(133, 40, 'Botón Ejecutar Backup', 'Permite ejecutar backups manualmente', 1),
(134, 40, 'Botón Activar/Desactivar Política', 'Permite activar o desactivar políticas', 1),
(135, 40, 'Botón Eliminar Política', 'Permite eliminar políticas de backup', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- Asignar todos los componentes al grupo Administrador (id_grupo = 1)
INSERT IGNORE INTO grupocomponente (id_grupo, id_componente) VALUES
(1, 130),
(1, 131),
(1, 132),
(1, 133),
(1, 134),
(1, 135);

-- ================================================
-- VERIFICACIÓN
-- ================================================
-- Ejecutar después de la migración para verificar:
-- SELECT * FROM politica_backup;
-- SELECT * FROM formulario WHERE id_formulario = 40;
-- SELECT * FROM componente WHERE id_formulario = 40;
-- SELECT * FROM grupocomponente WHERE id_componente BETWEEN 130 AND 135;
