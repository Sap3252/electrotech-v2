-- ==========================================
-- MAQUINARIAS - RBAC
-- Script para agregar permisos RBAC al modulo de maquinarias
-- ==========================================
-- IDs utilizados: 
--   Modulo: 6
--   Formularios: 20-26
--   Componentes: 90-120
-- ==========================================

USE electrotech2;

-- ==========================================
-- LIMPIAR COMPONENTES ANTERIORES DEL MODULO 6 (si existen)
-- ==========================================
DELETE gc FROM GrupoComponente gc
JOIN Componente c ON c.id_componente = gc.id_componente
JOIN Formulario f ON f.id_formulario = c.id_formulario
WHERE f.id_modulo = 6;

DELETE c FROM Componente c
JOIN Formulario f ON f.id_formulario = c.id_formulario
WHERE f.id_modulo = 6;

DELETE FROM Formulario WHERE id_modulo = 6;
DELETE FROM Modulo WHERE id_modulo = 6;

-- ==========================================
-- MODULO MAQUINARIAS
-- ==========================================

INSERT INTO Modulo (id_modulo, nombre, descripcion, icono, orden) VALUES
(6, 'Maquinarias', 'Gestion de cabinas, pistolas y hornos', 'settings-2', 6);

-- ==========================================
-- FORMULARIOS DEL MODULO MAQUINARIAS
-- ==========================================

INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
-- ABM Principal
(20, 6, 'Gestion de Maquinarias', '/dashboard/maquinarias', 1),
-- Reportes de Maquinarias
(21, 6, 'Reportes Maquinarias Principal', '/reportes/maquinarias', 2),
(22, 6, 'Reporte Uso Cabinas', '/reportes/maquinarias/uso-cabinas', 3),
(23, 6, 'Reporte Productividad Diaria', '/reportes/maquinarias/productividad-diaria', 4),
(24, 6, 'Reporte Mantenimiento Pistolas', '/reportes/maquinarias/mantenimiento-pistolas', 5),
(25, 6, 'Reporte Mantenimiento Hornos', '/reportes/maquinarias/mantenimiento-hornos', 6),
(26, 6, 'Reporte Consumo Gas', '/reportes/maquinarias/consumo-gas', 7),
(27, 6, 'Reporte Cabinas', '/reportes/cabinas', 8);

-- ==========================================
-- COMPONENTES PARA GESTION DE MAQUINARIAS (id_formulario=20)
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
-- Acceso a la pagina
(90, 20, 'Acceso Gestion Maquinarias', 'acceso'),

-- Tabs
(91, 20, 'Tab Cabinas', 'seccion'),
(92, 20, 'Tab Pistolas', 'seccion'),
(93, 20, 'Tab Hornos', 'seccion'),

-- Visualizacion de cards
(94, 20, 'Ver Cards Cabinas', 'otro'),
(95, 20, 'Ver Cards Pistolas', 'otro'),
(96, 20, 'Ver Cards Hornos', 'otro'),

-- Formularios de creacion
(97, 20, 'Formulario Nueva Cabina', 'formulario'),
(98, 20, 'Formulario Nueva Pistola', 'formulario'),
(99, 20, 'Formulario Nuevo Horno', 'formulario'),

-- Botones de edicion
(100, 20, 'Boton Editar Cabina', 'boton'),
(101, 20, 'Boton Editar Pistola', 'boton'),
(102, 20, 'Boton Editar Horno', 'boton'),

-- Botones de eliminacion
(103, 20, 'Boton Eliminar Cabina', 'boton'),
(104, 20, 'Boton Eliminar Pistola', 'boton'),
(105, 20, 'Boton Eliminar Horno', 'boton'),

-- Botones de mantenimiento
(106, 20, 'Boton Registrar Mantenimiento Pistola', 'boton'),
(107, 20, 'Boton Registrar Mantenimiento Horno', 'boton');

-- ==========================================
-- COMPONENTES PARA REPORTES DE MAQUINARIAS
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
-- Reporte Principal Maquinarias (id_formulario=21)
(108, 21, 'Acceso Reportes Maquinarias', 'acceso'),

-- Reporte Uso Cabinas (id_formulario=22)
(109, 22, 'Acceso Reporte Uso Cabinas', 'acceso'),

-- Reporte Productividad Diaria (id_formulario=23)
(110, 23, 'Acceso Reporte Productividad Diaria', 'acceso'),

-- Reporte Mantenimiento Pistolas (id_formulario=24)
(111, 24, 'Acceso Reporte Mantenimiento Pistolas', 'acceso'),

-- Reporte Mantenimiento Hornos (id_formulario=25)
(112, 25, 'Acceso Reporte Mantenimiento Hornos', 'acceso'),

-- Reporte Consumo Gas (id_formulario=26)
(113, 26, 'Acceso Reporte Consumo Gas', 'acceso'),

-- Reporte Cabinas (id_formulario=27)
(114, 27, 'Acceso Reporte Cabinas', 'acceso');

-- ==========================================
-- ASIGNAR PERMISOS A ADMIN (id_grupo=1)
-- ==========================================

INSERT INTO GrupoComponente (id_grupo, id_componente) VALUES
-- Gestion de Maquinarias
(1, 90), (1, 91), (1, 92), (1, 93),
(1, 94), (1, 95), (1, 96),
(1, 97), (1, 98), (1, 99),
(1, 100), (1, 101), (1, 102),
(1, 103), (1, 104), (1, 105),
(1, 106), (1, 107),
-- Reportes
(1, 108), (1, 109), (1, 110), (1, 111), (1, 112), (1, 113), (1, 114);

-- ==========================================
-- VERIFICACION
-- ==========================================

SELECT 
    'Modulo Maquinarias agregado al RBAC' AS Status,
    COUNT(*) AS Componentes_Creados
FROM Componente c
JOIN Formulario f ON f.id_formulario = c.id_formulario
WHERE f.id_modulo = 6;

-- Mostrar estructura del modulo Maquinarias
SELECT 
    m.nombre AS Modulo,
    f.nombre AS Formulario,
    f.ruta AS Ruta,
    c.id_componente AS ID,
    c.nombre AS Componente,
    c.tipo AS Tipo,
    CASE WHEN gc.id_grupo = 1 THEN 'SI' ELSE 'NO' END AS Admin
FROM Modulo m
JOIN Formulario f ON f.id_modulo = m.id_modulo
JOIN Componente c ON c.id_formulario = f.id_formulario
LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente AND gc.id_grupo = 1
WHERE m.id_modulo = 6
ORDER BY f.orden, c.id_componente;
