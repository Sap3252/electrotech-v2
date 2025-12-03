-- ==========================================
-- RBAC - Agregar sub-rutas de reportes de maquinarias
-- ==========================================

USE electrotech2;

-- ==========================================
-- AGREGAR FORMULARIOS PARA CADA SUB-REPORTE
-- ==========================================

-- Verificar que exista el módulo Maquinarias (id=5)
-- y el formulario Reportes de Maquinarias (id=17)

-- Insertar nuevos formularios para cada sub-reporte
INSERT INTO Formulario (id_modulo, nombre, ruta, descripcion, orden) VALUES
(5, 'Reporte Uso de Cabinas', '/reportes/maquinarias/uso-cabinas', 'Estadísticas de uso de cabinas', 3),
(5, 'Reporte Mantenimiento Pistolas', '/reportes/maquinarias/mantenimiento-pistolas', 'Estado de mantenimiento de pistolas', 4),
(5, 'Reporte Mantenimiento Hornos', '/reportes/maquinarias/mantenimiento-hornos', 'Estado de mantenimiento de hornos', 5),
(5, 'Reporte Consumo de Gas', '/reportes/maquinarias/consumo-gas', 'Análisis de consumo de gas', 6),
(5, 'Reporte Productividad Diaria', '/reportes/maquinarias/productividad-diaria', 'Productividad diaria del sistema', 7)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- AGREGAR COMPONENTES PARA CADA SUB-REPORTE
-- Cada uno necesita al menos un componente para que RBAC funcione
-- ==========================================

-- Obtener IDs de los formularios recién creados y agregar componentes
INSERT INTO Componente (id_formulario, nombre, tipo, descripcion)
SELECT f.id_formulario, 'Acceso Reporte', 'acceso', CONCAT('Acceso a ', f.nombre)
FROM Formulario f
WHERE f.ruta IN (
    '/reportes/maquinarias/uso-cabinas',
    '/reportes/maquinarias/mantenimiento-pistolas',
    '/reportes/maquinarias/mantenimiento-hornos',
    '/reportes/maquinarias/consumo-gas',
    '/reportes/maquinarias/productividad-diaria'
)
AND NOT EXISTS (
    SELECT 1 FROM Componente c WHERE c.id_formulario = f.id_formulario
);

-- ==========================================
-- ASIGNAR PERMISOS AL ADMIN
-- ==========================================

INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente)
SELECT 1, c.id_componente 
FROM Componente c
JOIN Formulario f ON f.id_formulario = c.id_formulario
WHERE f.ruta LIKE '/reportes/maquinarias/%';

-- ==========================================
-- ELIMINAR COMPONENTES VIEJOS DE REPORTES DEL FORMULARIO 17
-- (ya no los necesitamos porque ahora cada reporte tiene su propio formulario)
-- ==========================================

SET SQL_SAFE_UPDATES = 0;

DELETE FROM GrupoComponente WHERE id_componente IN (
    SELECT id_componente FROM (
        SELECT c.id_componente FROM Componente c 
        WHERE c.id_formulario = 17 
        AND c.nombre LIKE 'Reporte %'
    ) AS temp
);

DELETE FROM Componente WHERE id_formulario = 17 AND nombre LIKE 'Reporte %';

SET SQL_SAFE_UPDATES = 1;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

SELECT f.ruta, c.nombre AS componente, 
       GROUP_CONCAT(g.nombre) AS grupos_con_acceso
FROM Formulario f
JOIN Componente c ON c.id_formulario = f.id_formulario
LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente
LEFT JOIN Grupo g ON g.id_grupo = gc.id_grupo
WHERE f.ruta LIKE '/reportes/maquinarias%'
GROUP BY f.ruta, c.nombre
ORDER BY f.ruta;
