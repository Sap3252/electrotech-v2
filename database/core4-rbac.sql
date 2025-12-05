-- ==========================================
-- CORE 4 - EMPLEADOS - RBAC
-- Script para agregar permisos RBAC al modulo de empleados
-- ==========================================
-- IDs utilizados: 
--   Modulo: 5
--   Formularios: 16-19
--   Componentes: 70-89 (para evitar conflictos con existentes)
-- ==========================================

USE electrotech2;

-- ==========================================
-- LIMPIAR COMPONENTES ANTERIORES DEL MODULO 5 (si existen)
-- ==========================================
DELETE gc FROM GrupoComponente gc
JOIN Componente c ON c.id_componente = gc.id_componente
JOIN Formulario f ON f.id_formulario = c.id_formulario
WHERE f.id_modulo = 5;

DELETE c FROM Componente c
JOIN Formulario f ON f.id_formulario = c.id_formulario
WHERE f.id_modulo = 5;

DELETE FROM Formulario WHERE id_modulo = 5;
DELETE FROM Modulo WHERE id_modulo = 5;

-- ==========================================
-- MODULO EMPLEADOS
-- ==========================================

INSERT INTO Modulo (id_modulo, nombre, descripcion, icono, orden) VALUES
(5, 'Empleados y Nomina', 'Gestion de empleados, asistencia y recibos de sueldo', 'users', 5);

-- ==========================================
-- FORMULARIOS DEL MODULO EMPLEADOS
-- ==========================================

INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(16, 5, 'Gestion de Empleados', '/dashboard/empleados', 1),
(17, 5, 'Asistencia Empleado', '/dashboard/empleados/[id]/asistencia', 2),
(18, 5, 'Recibos Empleado', '/dashboard/empleados/[id]/recibos', 3),
(19, 5, 'Gestion de Recibos', '/dashboard/recibos', 4);

-- ==========================================
-- COMPONENTES PARA GESTION DE EMPLEADOS (id_formulario=16)
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
-- Acceso a la pagina
(70, 16, 'Acceso Gestion Empleados', 'acceso'),
-- Componentes de la pagina
(71, 16, 'Formulario Nuevo Empleado', 'formulario'),
(72, 16, 'Tabla Listado Empleados', 'tabla'),
(73, 16, 'Boton Editar Empleado', 'boton'),
(74, 16, 'Boton Desactivar Empleado', 'boton'),
(75, 16, 'Boton Ver Asistencia', 'boton'),
(76, 16, 'Boton Ver Recibos', 'boton');

-- ==========================================
-- COMPONENTES PARA ASISTENCIA (id_formulario=17)
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
-- Acceso a la pagina
(77, 17, 'Acceso Asistencia Empleado', 'acceso'),
-- Componentes de la pagina
(78, 17, 'Calendario Asistencia', 'otro'),
(79, 17, 'Boton Auto-cargar Asistencias', 'boton'),
(80, 17, 'Formulario Registrar Asistencia', 'formulario');

-- ==========================================
-- COMPONENTES PARA RECIBOS EMPLEADO (id_formulario=18)
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
-- Acceso a la pagina
(81, 18, 'Acceso Recibos Empleado', 'acceso'),
-- Componentes de la pagina
(82, 18, 'Tabla Historial Recibos', 'tabla'),
(83, 18, 'Boton Generar Recibo', 'boton'),
(84, 18, 'Boton Ver Detalle Recibo', 'boton'),
(85, 18, 'Boton Descargar PDF', 'boton');

-- ==========================================
-- COMPONENTES PARA GESTION DE RECIBOS (id_formulario=19)
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
-- Acceso a la pagina
(86, 19, 'Acceso Gestion Recibos', 'acceso'),
-- Componentes de la pagina
(87, 19, 'Tabla Todos los Recibos', 'tabla'),
(88, 19, 'Boton Generar Recibos Masivo', 'boton'),
(89, 19, 'Boton Ver Recibo Individual', 'boton');

-- ==========================================
-- ASIGNAR PERMISOS A ADMIN
-- ==========================================

-- Admin (id_grupo=1) tiene todos los componentes del modulo Empleados
INSERT INTO GrupoComponente (id_grupo, id_componente) VALUES
(1, 70), (1, 71), (1, 72), (1, 73), (1, 74), (1, 75), (1, 76),
(1, 77), (1, 78), (1, 79), (1, 80),
(1, 81), (1, 82), (1, 83), (1, 84), (1, 85),
(1, 86), (1, 87), (1, 88), (1, 89);

-- ==========================================
-- VERIFICACION
-- ==========================================

SELECT 
    'Modulo Empleados agregado al RBAC' AS Status,
    COUNT(*) AS Componentes_Creados
FROM Componente c
JOIN Formulario f ON f.id_formulario = c.id_formulario
WHERE f.id_modulo = 5;

-- Mostrar estructura del modulo Empleados
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
WHERE m.id_modulo = 5
ORDER BY f.orden, c.id_componente;
