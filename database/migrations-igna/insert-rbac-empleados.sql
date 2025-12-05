-- Migration: Insert módulo, formularios y componentes para Empleados
-- Usage: mysql -u user -p electrotech2 < database/migrations/insert-rbac-empleados.sql

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =====================================================
-- MÓDULO EMPLEADOS (id 6)
-- =====================================================
INSERT INTO `modulo` (id_modulo, nombre, descripcion, icono, orden, activo, created_at)
VALUES
(6, 'Empleados', 'Gestión de empleados, asistencia y recibos', 'users', 6, 1, NOW())
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre), descripcion = VALUES(descripcion), icono = VALUES(icono), orden = VALUES(orden), activo = VALUES(activo);

-- =====================================================
-- FORMULARIOS DE EMPLEADOS
-- IDs 25, 26, 27 (disponibles)
-- =====================================================
INSERT INTO `formulario` (id_formulario, id_modulo, nombre, ruta, descripcion, icono, orden, activo, created_at)
VALUES
(25, 6, 'Gestión de Empleados', '/dashboard/empleados', 'Listado y administración de empleados', 'user', 1, 1, NOW()),
(26, 6, 'Asistencia de Empleado', '/dashboard/empleados/[id]/asistencia', 'Registro de asistencia por empleado', 'calendar', 2, 1, NOW()),
(27, 6, 'Recibos de Sueldo', '/dashboard/empleados/[id]/recibos', 'Generación y gestión de recibos de sueldo', 'file-text', 3, 1, NOW())
ON DUPLICATE KEY UPDATE
  id_modulo = VALUES(id_modulo), nombre = VALUES(nombre), ruta = VALUES(ruta), descripcion = VALUES(descripcion), icono = VALUES(icono), orden = VALUES(orden), activo = VALUES(activo);

-- =====================================================
-- COMPONENTES DE GESTIÓN DE EMPLEADOS (Formulario 25)
-- IDs 71-76 (según el frontend)
-- =====================================================
INSERT INTO `componente` (id_componente, id_formulario, nombre, descripcion, tipo, activo, created_at)
VALUES
(71, 25, 'Formulario Nuevo Empleado', 'Formulario para crear nuevos empleados', 'formulario', 1, NOW()),
(72, 25, 'Tabla Listado Empleados', 'Tabla con el listado de empleados', 'tabla', 1, NOW()),
(73, 25, 'Botón Editar Empleado', 'Botón para editar datos del empleado', 'boton', 1, NOW()),
(74, 25, 'Botón Desactivar/Reactivar Empleado', 'Botón para desactivar o reactivar empleado', 'boton', 1, NOW()),
(75, 25, 'Botón Ver Asistencia', 'Botón para acceder a la asistencia del empleado', 'boton', 1, NOW()),
(76, 25, 'Botón Ver Recibos', 'Botón para acceder a los recibos del empleado', 'boton', 1, NOW())
ON DUPLICATE KEY UPDATE
  id_formulario = VALUES(id_formulario), nombre = VALUES(nombre), descripcion = VALUES(descripcion), tipo = VALUES(tipo), activo = VALUES(activo);

-- =====================================================
-- COMPONENTES DE ASISTENCIA (Formulario 26)
-- IDs 77-80
-- =====================================================
INSERT INTO `componente` (id_componente, id_formulario, nombre, descripcion, tipo, activo, created_at)
VALUES
(77, 26, 'Acceso Página Asistencia', 'Acceso a la página de asistencia', 'acceso', 1, NOW()),
(78, 26, 'Calendario Asistencias', 'Vista del calendario de asistencias', 'otro', 1, NOW()),
(79, 26, 'Botón Auto-cargar Asistencias', 'Botón para cargar asistencias automáticamente', 'boton', 1, NOW()),
(80, 26, 'Botón Guardar Asistencia', 'Botón para guardar registro de asistencia', 'boton', 1, NOW())
ON DUPLICATE KEY UPDATE
  id_formulario = VALUES(id_formulario), nombre = VALUES(nombre), descripcion = VALUES(descripcion), tipo = VALUES(tipo), activo = VALUES(activo);

-- =====================================================
-- COMPONENTES DE RECIBOS (Formulario 27)
-- IDs 81-85
-- =====================================================
INSERT INTO `componente` (id_componente, id_formulario, nombre, descripcion, tipo, activo, created_at)
VALUES
(81, 27, 'Acceso Página Recibos', 'Acceso a la página de recibos', 'acceso', 1, NOW()),
(82, 27, 'Tabla Historial Recibos', 'Tabla con historial de recibos generados', 'tabla', 1, NOW()),
(83, 27, 'Botón Generar Recibo', 'Botón para generar un nuevo recibo de sueldo', 'boton', 1, NOW()),
(84, 27, 'Botón Ver Detalle Recibo', 'Botón para ver el detalle del recibo', 'boton', 1, NOW()),
(85, 27, 'Botón Descargar PDF', 'Botón para descargar recibo en PDF', 'boton', 1, NOW())
ON DUPLICATE KEY UPDATE
  id_formulario = VALUES(id_formulario), nombre = VALUES(nombre), descripcion = VALUES(descripcion), tipo = VALUES(tipo), activo = VALUES(activo);

-- =====================================================
-- GRUPOCOMPONENTE - Asignar al grupo ADMIN (id_grupo = 1)
-- =====================================================
INSERT INTO `grupocomponente` (id_grupo, id_componente, created_at)
VALUES
-- Componentes de Gestión de Empleados (71-76)
(1, 71, NOW()),
(1, 72, NOW()),
(1, 73, NOW()),
(1, 74, NOW()),
(1, 75, NOW()),
(1, 76, NOW()),
-- Componentes de Asistencia (77-80)
(1, 77, NOW()),
(1, 78, NOW()),
(1, 79, NOW()),
(1, 80, NOW()),
-- Componentes de Recibos (81-85)
(1, 81, NOW()),
(1, 82, NOW()),
(1, 83, NOW()),
(1, 84, NOW()),
(1, 85, NOW())
ON DUPLICATE KEY UPDATE created_at = VALUES(created_at);

COMMIT;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- =====================================================
-- Resumen:
-- =====================================================
-- MÓDULO:
--   6 - Empleados
--
-- FORMULARIOS:
--   25 - Gestión de Empleados (/dashboard/empleados)
--   26 - Asistencia de Empleado (/dashboard/empleados/[id]/asistencia)
--   27 - Recibos de Sueldo (/dashboard/empleados/[id]/recibos)
--
-- COMPONENTES:
--   71 - Formulario Nuevo Empleado
--   72 - Tabla Listado Empleados
--   73 - Botón Editar Empleado
--   74 - Botón Desactivar/Reactivar Empleado
--   75 - Botón Ver Asistencia
--   76 - Botón Ver Recibos
--   77 - Acceso Página Asistencia
--   78 - Calendario Asistencias
--   79 - Botón Auto-cargar Asistencias
--   80 - Botón Guardar Asistencia
--   81 - Acceso Página Recibos
--   82 - Tabla Historial Recibos
--   83 - Botón Generar Recibo
--   84 - Botón Ver Detalle Recibo
--   85 - Botón Descargar PDF
--
-- GRUPOCOMPONENTE:
--   Todos asignados al grupo ADMIN (id_grupo = 1)
-- =====================================================

-- End migration
