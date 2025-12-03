-- ==========================================
-- RBAC - MAQUINARIAS (Core 3)
-- ==========================================
-- Script para agregar formularios y componentes
-- de maquinarias al sistema RBAC
-- Date: 2025-12-03
-- ==========================================

USE electrotech2;

-- ==========================================
-- NUEVO MÓDULO: MAQUINARIAS
-- ==========================================

INSERT INTO Modulo (id_modulo, nombre, descripcion, icono, orden) VALUES
(5, 'Maquinarias', 'Gestión y control de maquinarias de pintura', 'factory', 5)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- ==========================================
-- FORMULARIOS DE MAQUINARIAS
-- ==========================================

INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, descripcion, orden) VALUES
(16, 5, 'Gestión de Maquinarias', '/dashboard/maquinarias', 'Administración de maquinarias', 1),
(17, 5, 'Reportes de Maquinarias', '/reportes/maquinarias', 'Reportes e informes de maquinarias', 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_modulo=VALUES(id_modulo), ruta=VALUES(ruta);

-- ==========================================
-- COMPONENTES DE GESTIÓN DE MAQUINARIAS
-- ==========================================

-- Componentes para Gestión de Maquinarias (id_formulario=16)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(30, 16, 'Formulario Nueva Maquinaria', 'formulario', 'Crear nueva maquinaria'),
(31, 16, 'Tabla Listado Maquinarias', 'tabla', 'Ver listado de maquinarias'),
(32, 16, 'Botón Ver Detalle Maquinaria', 'boton', 'Ver detalle y historial de maquinaria'),
(33, 16, 'Botón Editar Maquinaria', 'boton', 'Editar datos de maquinaria'),
(34, 16, 'Botón Eliminar Maquinaria', 'boton', 'Eliminar maquinaria'),
(35, 16, 'Botón Registrar Mantenimiento', 'boton', 'Registrar mantenimiento de maquinaria'),
(36, 16, 'Ver Alertas Maquinaria', 'seccion', 'Ver alertas y notificaciones')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_formulario=VALUES(id_formulario), tipo=VALUES(tipo);

-- Componentes para Reportes de Maquinarias (id_formulario=17)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(37, 17, 'Acceso Reportes Maquinarias', 'acceso', 'Acceso a reportes de maquinarias'),
(38, 17, 'Reporte Resumen General', 'seccion', 'Ver resumen general de maquinarias'),
(39, 17, 'Reporte Uso Diario', 'seccion', 'Ver uso diario de maquinarias'),
(40, 17, 'Reporte Pinturas Más Usadas', 'seccion', 'Ver pinturas más usadas por maquinaria'),
(41, 17, 'Reporte Historial Mensual', 'seccion', 'Ver historial mensual de producción')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_formulario=VALUES(id_formulario), tipo=VALUES(tipo);

-- ==========================================
-- COMPONENTE EN PIEZAS PINTADAS
-- ==========================================

-- Agregar componente para selección de maquinaria en piezas pintadas
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo, descripcion) VALUES
(42, 3, 'Selector Maquinaria', 'formulario', 'Seleccionar maquinaria para pintar piezas')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_formulario=VALUES(id_formulario);

-- ==========================================
-- ASIGNAR PERMISOS AL GRUPO ADMIN
-- ==========================================

-- Asegurar que Admin (id_grupo=1) tiene todos los nuevos componentes
INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente)
SELECT 1, id_componente FROM Componente WHERE id_componente >= 30;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Mostrar los nuevos registros
SELECT 'Módulos' AS tipo, COUNT(*) AS total FROM Modulo WHERE id_modulo = 5
UNION ALL
SELECT 'Formularios Maquinarias', COUNT(*) FROM Formulario WHERE id_modulo = 5
UNION ALL
SELECT 'Componentes Maquinarias', COUNT(*) FROM Componente WHERE id_formulario IN (16, 17)
UNION ALL
SELECT 'Permisos Admin asignados', COUNT(*) FROM GrupoComponente WHERE id_grupo = 1 AND id_componente >= 30;

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================
