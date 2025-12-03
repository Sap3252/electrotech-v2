-- ==========================================
-- RBAC - MAQUINARIAS V3 (Limpieza)
-- ==========================================
-- Elimina componentes innecesarios y deja solo los que se usan
-- ==========================================

USE electrotech2;

-- Desactivar modo seguro temporalmente
SET SQL_SAFE_UPDATES = 0;

-- ==========================================
-- ELIMINAR COMPONENTES INNECESARIOS
-- ==========================================

-- Eliminar asignaciones primero
DELETE FROM GrupoComponente WHERE id_componente IN (
    SELECT id_componente FROM (
        SELECT id_componente FROM Componente 
        WHERE nombre IN (
            'Tabla Listado Cabinas',
            'Tabla Listado Pistolas', 
            'Tabla Listado Hornos',
            'Botón Cambiar Estado Cabina',
            'Panel Resumen Maquinarias',
            'Ver Alertas Maquinarias'
        )
    ) AS temp
);

-- Eliminar componentes
DELETE FROM Componente WHERE nombre IN (
    'Tabla Listado Cabinas',
    'Tabla Listado Pistolas', 
    'Tabla Listado Hornos',
    'Botón Cambiar Estado Cabina',
    'Panel Resumen Maquinarias',
    'Ver Alertas Maquinarias'
);

-- ==========================================
-- AGREGAR COMPONENTE PARA VER CARDS
-- ==========================================

-- Componente para ver las cards de cada sección
INSERT INTO Componente (id_formulario, nombre, tipo, descripcion) 
SELECT 16, 'Ver Cards Cabinas', 'seccion', 'Ver listado de cabinas existentes'
WHERE NOT EXISTS (SELECT 1 FROM Componente WHERE nombre = 'Ver Cards Cabinas');

INSERT INTO Componente (id_formulario, nombre, tipo, descripcion) 
SELECT 16, 'Ver Cards Pistolas', 'seccion', 'Ver listado de pistolas existentes'
WHERE NOT EXISTS (SELECT 1 FROM Componente WHERE nombre = 'Ver Cards Pistolas');

INSERT INTO Componente (id_formulario, nombre, tipo, descripcion) 
SELECT 16, 'Ver Cards Hornos', 'seccion', 'Ver listado de hornos existentes'
WHERE NOT EXISTS (SELECT 1 FROM Componente WHERE nombre = 'Ver Cards Hornos');

-- ==========================================
-- ASIGNAR PERMISOS AL ADMIN
-- ==========================================

INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente)
SELECT 1, id_componente FROM Componente WHERE nombre IN ('Ver Cards Cabinas', 'Ver Cards Pistolas', 'Ver Cards Hornos');

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

SELECT c.id_componente, c.nombre, c.tipo, 
       GROUP_CONCAT(g.nombre) as grupos_con_acceso
FROM Componente c
LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente
LEFT JOIN Grupo g ON g.id_grupo = gc.id_grupo
WHERE c.id_formulario = 16
GROUP BY c.id_componente, c.nombre, c.tipo
ORDER BY c.nombre;

-- Reactivar modo seguro
SET SQL_SAFE_UPDATES = 1;
