-- ==========================================
-- RBAC - MAQUINARIAS V2 (Cabinas/Pistolas/Hornos)
-- ==========================================
-- Script para actualizar componentes RBAC
-- al nuevo sistema de Cabinas, Pistolas y Hornos
-- Date: 2025-12-03
-- ==========================================

USE electrotech2;

-- ==========================================
-- ELIMINAR COMPONENTES ANTIGUOS
-- ==========================================

-- Primero eliminar las asignaciones de grupo para los componentes antiguos
DELETE FROM GrupoComponente WHERE id_componente >= 30 AND id_componente <= 42;

-- Eliminar componentes antiguos
DELETE FROM Componente WHERE id_componente >= 30 AND id_componente <= 42;

-- ==========================================
-- ACTUALIZAR FORMULARIOS
-- ==========================================

UPDATE Formulario SET 
    nombre = 'Gestión de Maquinarias',
    descripcion = 'Administración de Cabinas, Pistolas y Hornos'
WHERE id_formulario = 16;

UPDATE Formulario SET 
    nombre = 'Reportes de Maquinarias',
    descripcion = 'Reportes de uso, mantenimiento y productividad'
WHERE id_formulario = 17;

-- ==========================================
-- NUEVOS COMPONENTES - GESTIÓN DE CABINAS
-- ==========================================
-- Tipos válidos: 'boton', 'tabla', 'formulario', 'seccion', 'acceso', 'otro'

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
-- Cabinas
(30, 16, 'Tab Cabinas', 'seccion', 'Acceso a pestaña de Cabinas'),
(31, 16, 'Formulario Nueva Cabina', 'formulario', 'Crear nueva cabina de pintura'),
(32, 16, 'Tabla Listado Cabinas', 'tabla', 'Ver listado de cabinas'),
(33, 16, 'Botón Editar Cabina', 'boton', 'Editar datos de cabina'),
(34, 16, 'Botón Eliminar Cabina', 'boton', 'Eliminar cabina'),
(35, 16, 'Botón Cambiar Estado Cabina', 'boton', 'Activar/Desactivar cabina')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- NUEVOS COMPONENTES - GESTIÓN DE PISTOLAS
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(36, 16, 'Tab Pistolas', 'seccion', 'Acceso a pestaña de Pistolas'),
(37, 16, 'Formulario Nueva Pistola', 'formulario', 'Crear nueva pistola de pintura'),
(38, 16, 'Tabla Listado Pistolas', 'tabla', 'Ver listado de pistolas'),
(39, 16, 'Botón Editar Pistola', 'boton', 'Editar datos de pistola'),
(40, 16, 'Botón Eliminar Pistola', 'boton', 'Eliminar pistola'),
(41, 16, 'Botón Registrar Mantenimiento Pistola', 'boton', 'Registrar mantenimiento de pistola')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- NUEVOS COMPONENTES - GESTIÓN DE HORNOS
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(42, 16, 'Tab Hornos', 'seccion', 'Acceso a pestaña de Hornos'),
(43, 16, 'Formulario Nuevo Horno', 'formulario', 'Crear nuevo horno de curado'),
(44, 16, 'Tabla Listado Hornos', 'tabla', 'Ver listado de hornos'),
(45, 16, 'Botón Editar Horno', 'boton', 'Editar datos de horno'),
(46, 16, 'Botón Eliminar Horno', 'boton', 'Eliminar horno'),
(47, 16, 'Botón Registrar Mantenimiento Horno', 'boton', 'Registrar mantenimiento de horno'),
(48, 16, 'Botón Registrar Consumo Gas', 'boton', 'Registrar consumo de gas del horno')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- COMPONENTES GENERALES DE MAQUINARIAS
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(49, 16, 'Ver Alertas Maquinarias', 'seccion', 'Ver alertas de mantenimiento'),
(50, 16, 'Panel Resumen Maquinarias', 'seccion', 'Ver panel resumen con estadísticas')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- COMPONENTES DE REPORTES DE MAQUINARIAS
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(51, 17, 'Acceso Reportes Maquinarias', 'acceso', 'Acceso general a reportes'),
(52, 17, 'Reporte Uso de Cabinas', 'seccion', 'Ver estadísticas de uso de cabinas'),
(53, 17, 'Reporte Mantenimiento Pistolas', 'seccion', 'Ver historial de mantenimiento de pistolas'),
(54, 17, 'Reporte Mantenimiento Hornos', 'seccion', 'Ver historial de mantenimiento de hornos'),
(55, 17, 'Reporte Consumo de Gas', 'seccion', 'Ver consumo de gas por horno'),
(56, 17, 'Reporte Productividad Diaria', 'seccion', 'Ver productividad diaria del sistema')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- COMPONENTE EN PIEZAS PINTADAS
-- ==========================================

INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(57, 3, 'Selector Cabina', 'formulario', 'Seleccionar cabina para pintar piezas'),
(58, 3, 'Selector Pistola', 'formulario', 'Seleccionar pistola para pintar piezas'),
(59, 3, 'Selector Horno', 'formulario', 'Seleccionar horno para curado')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- ASIGNAR TODOS LOS PERMISOS AL GRUPO ADMIN
-- ==========================================

-- Admin (id_grupo=1) tiene todos los nuevos componentes
INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente)
SELECT 1, id_componente FROM Componente WHERE id_componente >= 30;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

SELECT 'Componentes Cabinas' AS categoria, COUNT(*) AS total 
FROM Componente WHERE id_formulario = 16 AND nombre LIKE '%Cabina%'
UNION ALL
SELECT 'Componentes Pistolas', COUNT(*) 
FROM Componente WHERE id_formulario = 16 AND nombre LIKE '%Pistola%'
UNION ALL
SELECT 'Componentes Hornos', COUNT(*) 
FROM Componente WHERE id_formulario = 16 AND nombre LIKE '%Horno%'
UNION ALL
SELECT 'Componentes Reportes', COUNT(*) 
FROM Componente WHERE id_formulario = 17
UNION ALL
SELECT 'Total Permisos Admin', COUNT(*) 
FROM GrupoComponente WHERE id_grupo = 1 AND id_componente >= 30;

-- ==========================================
-- MOSTRAR TODOS LOS COMPONENTES NUEVOS
-- ==========================================

SELECT 
    m.nombre AS modulo,
    f.nombre AS formulario,
    c.id_componente,
    c.nombre AS componente,
    c.tipo
FROM Componente c
JOIN Formulario f ON c.id_formulario = f.id_formulario
JOIN Modulo m ON f.id_modulo = m.id_modulo
WHERE c.id_componente >= 30
ORDER BY f.id_formulario, c.id_componente;
