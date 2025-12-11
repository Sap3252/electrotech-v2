-- =====================================================
-- SISTEMA DE AUDITORÍA Y TRAZABILIDAD - ELECTROTECH
-- Versión actualizada - Diciembre 2025
-- =====================================================
-- NOTA: La auditoría se realiza desde la API de Next.js
-- para poder capturar el id_usuario de la sesión.
-- NO se usan triggers porque MySQL no puede acceder a
-- variables de sesión de la aplicación.
-- =====================================================

USE electrotech2;

-- =====================================================
-- TABLA: AuditoriaSesion (Login/Logout de usuarios)
-- =====================================================
DROP TABLE IF EXISTS AuditoriaSesion;

CREATE TABLE AuditoriaSesion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_hora_login DATETIME NOT NULL,
    fecha_hora_logout DATETIME NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_login (fecha_hora_login),
    INDEX idx_logout (fecha_hora_logout)
);

-- =====================================================
-- TABLA: AuditoriaTrazabilidad (Cambios en registros)
-- =====================================================
DROP TABLE IF EXISTS AuditoriaTrazabilidad;

CREATE TABLE AuditoriaTrazabilidad (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    id_registro INT NOT NULL,
    accion ENUM('INSERT','UPDATE','DELETE','FACTURADO') NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario_sistema VARCHAR(100),
    id_usuario INT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    INDEX idx_tabla (tabla_afectada),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_hora),
    INDEX idx_registro (tabla_afectada, id_registro),
    INDEX idx_usuario (id_usuario)
);

-- =====================================================
-- ELIMINAR TRIGGERS ANTIGUOS (si existen)
-- La auditoría se hace desde la API, no con triggers
-- =====================================================
DROP TRIGGER IF EXISTS trg_piezapintada_insert;
DROP TRIGGER IF EXISTS trg_piezapintada_update;
DROP TRIGGER IF EXISTS trg_piezapintada_delete;

-- =====================================================
-- DATOS DE EJEMPLO (opcional)
-- =====================================================
-- INSERT INTO AuditoriaSesion (id_usuario, fecha_hora_login, fecha_hora_logout)
-- VALUES (1, NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE));

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver todas las sesiones con nombre de usuario:
-- SELECT 
--     a.id,
--     u.nombre,
--     u.apellido,
--     u.email,
--     a.fecha_hora_login,
--     a.fecha_hora_logout,
--     TIMESTAMPDIFF(MINUTE, a.fecha_hora_login, a.fecha_hora_logout) as duracion_minutos
-- FROM AuditoriaSesion a
-- JOIN Usuario u ON a.id_usuario = u.id_usuario
-- ORDER BY a.fecha_hora_login DESC;

-- Ver trazabilidad con nombre de usuario:
-- SELECT 
--     t.id_auditoria,
--     t.tabla_afectada,
--     t.accion,
--     t.fecha_hora,
--     u.nombre,
--     u.apellido,
--     t.datos_nuevos
-- FROM AuditoriaTrazabilidad t
-- LEFT JOIN Usuario u ON t.id_usuario = u.id_usuario
-- ORDER BY t.fecha_hora DESC;

-- Estadísticas de sesiones por usuario:
-- SELECT 
--     u.nombre,
--     u.apellido,
--     COUNT(a.id) as total_sesiones,
--     COALESCE(SUM(TIMESTAMPDIFF(MINUTE, a.fecha_hora_login, a.fecha_hora_logout)), 0) as tiempo_total_minutos
-- FROM AuditoriaSesion a
-- JOIN Usuario u ON a.id_usuario = u.id_usuario
-- GROUP BY a.id_usuario, u.nombre, u.apellido
-- ORDER BY total_sesiones DESC;

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================
-- 1. La API /api/auditoria/sesiones maneja login/logout
-- 2. La API /api/piezas-pintadas inserta registros en 
--    AuditoriaTrazabilidad al crear/editar/eliminar
-- 3. Los datos_nuevos incluyen nombres de pieza, cabina
--    y pintura para mejor legibilidad
-- 4. El id_usuario se obtiene de la sesión JWT
-- =====================================================
