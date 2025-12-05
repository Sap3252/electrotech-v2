-- Migration: Insert módulos, formularios y componentes para Maquinarias y Piezas/Pinturas
-- Usage: mysql -u user -p electrotech2 < database/migrations/insert-rbac-maquinarias.sql

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- MÓDULOS
INSERT INTO `modulo` (id_modulo, nombre, descripcion, icono, orden, activo, created_at)
VALUES
(1, 'Piezas y Pinturas', 'Gestión de piezas, pinturas y producción', 'package', 1, 1, '2025-12-04 14:20:18'),
(2, 'Facturación', 'Facturas, remitos y clientes', 'receipt', 2, 1, '2025-12-04 14:20:18'),
(3, 'Reportes', 'Reportes y estadísticas del sistema', 'chart-bar', 3, 1, '2025-12-04 14:20:18'),
(4, 'Administración', 'Configuración y permisos', 'settings', 4, 1, '2025-12-04 14:20:18'),
(5, 'Maquinarias', 'Gestión de maquinaria y equipos', 'cog', 5, 1, '2025-12-04 19:24:10')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre), descripcion = VALUES(descripcion), icono = VALUES(icono), orden = VALUES(orden), activo = VALUES(activo), created_at = VALUES(created_at);

-- FORMULARIOS
INSERT INTO `formulario` (id_formulario, id_modulo, nombre, ruta, descripcion, icono, orden, activo, created_at)
VALUES
(1, 1, 'Gestión de Piezas', '/piezas', NULL, NULL, 1, 1, '2025-12-04 14:20:18'),
(2, 1, 'Gestión de Pinturas', '/pinturas', NULL, NULL, 2, 1, '2025-12-04 14:20:18'),
(3, 1, 'Piezas Pintadas', '/piezas-pintadas', NULL, NULL, 3, 1, '2025-12-04 14:20:18'),
(4, 1, 'Calculadora de Consumo', '/pinturas/calculadora', NULL, NULL, 4, 1, '2025-12-04 14:20:18'),
(5, 2, 'Remitos', '/remitos', NULL, NULL, 1, 1, '2025-12-04 14:20:18'),
(6, 2, 'Facturación', '/facturacion', NULL, NULL, 2, 1, '2025-12-04 14:20:18'),
(7, 2, 'Clientes', '/clientes', NULL, NULL, 3, 1, '2025-12-04 14:20:18'),
(8, 3, 'Participación Clientes', '/reportes/clientes', NULL, NULL, 1, 1, '2025-12-04 14:20:18'),
(9, 3, 'Pintura Más Utilizada', '/reportes/pintura-mas-utilizada', NULL, NULL, 2, 1, '2025-12-04 14:20:18'),
(10, 3, 'Ventas por Cliente', '/reportes/ventas-por-cliente', NULL, NULL, 3, 1, '2025-12-04 14:20:18'),
(11, 3, 'Evolución de Ventas', '/reportes/evolucion-ventas', NULL, NULL, 4, 1, '2025-12-04 14:20:18'),
(12, 3, 'Consumo Pintura por Mes', '/reportes/pintura-por-mes', NULL, NULL, 5, 1, '2025-12-04 14:20:18'),
(13, 3, 'Ventas Cliente Específico', '/reportes/ventas-cliente-especifico', NULL, NULL, 6, 1, '2025-12-04 14:20:18'),
(14, 4, 'Usuarios', '/dashboard/usuarios', NULL, NULL, 1, 1, '2025-12-04 14:20:18'),
(15, 3, 'Reportes Principal', '/reportes', NULL, NULL, 0, 1, '2025-12-04 14:20:18'),
(16, 5, 'Gestión de Maquinaria', '/dashboard/maquinarias', 'Gestión de maquinaria', 'cog', 0, 1, '2025-12-04 16:25:24'),
(17, 5, 'Reportes Maquinarias', '/reportes/maquinarias', 'Reportes y estadísticas de maquinaria', 'chart-bar', 0, 1, '2025-12-04 16:32:27'),
(20, 5, 'Uso Cabinas', '/reportes/maquinarias/uso-cabinas', 'Reporte: uso de cabinas', 'chart-bar', 1, 1, '2025-12-04 19:38:09'),
(21, 5, 'Productividad Diaria', '/reportes/maquinarias/productividad-diaria', 'Reporte: productividad diaria', 'chart-bar', 2, 1, '2025-12-04 19:38:09'),
(22, 5, 'Mantenimiento Pistolas', '/reportes/maquinarias/mantenimiento-pistolas', 'Reporte: mantenimiento de pistolas', 'chart-bar', 3, 1, '2025-12-04 19:38:09'),
(23, 5, 'Mantenimiento Hornos', '/reportes/maquinarias/mantenimiento-hornos', 'Reporte: mantenimiento de hornos', 'chart-bar', 4, 1, '2025-12-04 19:38:09'),
(24, 5, 'Consumo Gas', '/reportes/maquinarias/consumo-gas', 'Reporte: consumo de gas', 'chart-bar', 5, 1, '2025-12-04 19:38:09')
ON DUPLICATE KEY UPDATE
  id_modulo = VALUES(id_modulo), nombre = VALUES(nombre), ruta = VALUES(ruta), descripcion = VALUES(descripcion), icono = VALUES(icono), orden = VALUES(orden), activo = VALUES(activo), created_at = VALUES(created_at);

-- COMPONENTES
INSERT INTO `componente` (id_componente, id_formulario, nombre, descripcion, tipo, activo, created_at)
VALUES
(1, 1, 'Formulario Nueva Pieza', NULL, 'formulario', 1, '2025-12-04 14:20:18'),
(2, 1, 'Tabla Listado Piezas', NULL, 'tabla', 1, '2025-12-04 14:20:18'),
(3, 1, 'Botón Editar Pieza', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(4, 1, 'Botón Eliminar Pieza', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(5, 2, 'Formulario Nueva Pintura', NULL, 'formulario', 1, '2025-12-04 14:20:18'),
(6, 2, 'Tabla Listado Pinturas', NULL, 'tabla', 1, '2025-12-04 14:20:18'),
(7, 2, 'Botón Eliminar Pintura', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(8, 3, 'Formulario Registrar Producción', NULL, 'formulario', 1, '2025-12-04 14:20:18'),
(9, 3, 'Tabla Historial Producción', NULL, 'tabla', 1, '2025-12-04 14:20:18'),
(10, 5, 'Formulario Cargar Remito', NULL, 'formulario', 1, '2025-12-04 14:20:18'),
(11, 5, 'Tabla Listado Remitos', NULL, 'tabla', 1, '2025-12-04 14:20:18'),
(12, 5, 'Botón Ver Detalle', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(13, 5, 'Botón Imprimir PDF', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(14, 6, 'Formulario Generar Factura', NULL, 'formulario', 1, '2025-12-04 14:20:18'),
(15, 6, 'Tabla Listado Facturas', NULL, 'tabla', 1, '2025-12-04 14:20:18'),
(16, 6, 'Botón Ver Detalle Factura', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(17, 6, 'Botón Imprimir Factura', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(18, 8, 'Acceso Participación Clientes', NULL, 'acceso', 1, '2025-12-04 14:20:18'),
(19, 9, 'Acceso Pintura Más Utilizada', NULL, 'acceso', 1, '2025-12-04 14:20:18'),
(20, 10, 'Acceso Ventas por Cliente', NULL, 'acceso', 1, '2025-12-04 14:20:18'),
(21, 11, 'Acceso Evolución de Ventas', NULL, 'acceso', 1, '2025-12-04 14:20:18'),
(22, 12, 'Acceso Consumo Pintura por Mes', NULL, 'acceso', 1, '2025-12-04 14:20:18'),
(23, 3, 'Botón Eliminar Pieza Pintada', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(24, 2, 'Botón Editar Pintura', NULL, 'boton', 1, '2025-12-04 14:20:18'),
(27, 13, 'Acceso Ventas Cliente Específico', NULL, 'acceso', 1, '2025-12-04 14:20:18'),
(29, 15, 'Página Principal Reportes', NULL, 'otro', 1, '2025-12-04 14:20:18'),
(30, 16, 'Tab Cabinas', NULL, 'otro', 1, '2025-12-04 16:25:24'),
(31, 16, 'Ver Cards Cabinas', NULL, 'otro', 1, '2025-12-04 16:25:24'),
(32, 16, 'Formulario Nueva Cabina', NULL, 'formulario', 1, '2025-12-04 16:25:24'),
(33, 16, 'Botón Editar Cabina', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(34, 16, 'Botón Eliminar Cabina', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(35, 16, 'Tab Pistolas', NULL, 'otro', 1, '2025-12-04 16:25:24'),
(36, 16, 'Ver Cards Pistolas', NULL, 'otro', 1, '2025-12-04 16:25:24'),
(37, 16, 'Formulario Nueva Pistola', NULL, 'formulario', 1, '2025-12-04 16:25:24'),
(38, 16, 'Botón Editar Pistola', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(39, 16, 'Botón Eliminar Pistola', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(40, 16, 'Botón Registrar Mantenimiento Pistola', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(41, 16, 'Tab Hornos', NULL, 'otro', 1, '2025-12-04 16:25:24'),
(42, 16, 'Ver Cards Hornos', NULL, 'otro', 1, '2025-12-04 16:25:24'),
(43, 16, 'Formulario Nuevo Horno', NULL, 'formulario', 1, '2025-12-04 16:25:24'),
(44, 16, 'Botón Editar Horno', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(45, 16, 'Botón Eliminar Horno', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(46, 16, 'Botón Registrar Mantenimiento Horno', NULL, 'boton', 1, '2025-12-04 16:25:24'),
(47, 17, 'Submenu Maquinarias', NULL, 'otro', 1, '2025-12-04 16:32:27'),
(48, 20, 'Acceso - Uso Cabinas', NULL, 'acceso', 1, '2025-12-04 16:32:27'),
(49, 21, 'Acceso - Productividad Diaria', NULL, 'acceso', 1, '2025-12-04 16:32:27'),
(50, 22, 'Acceso - Mantenimiento Pistolas', NULL, 'acceso', 1, '2025-12-04 16:32:27'),
(51, 23, 'Acceso - Mantenimiento Hornos', NULL, 'acceso', 1, '2025-12-04 16:32:27'),
(52, 24, 'Acceso - Consumo Gas', NULL, 'acceso', 1, '2025-12-04 16:32:27')
ON DUPLICATE KEY UPDATE
  id_formulario = VALUES(id_formulario), id_formulario = VALUES(id_formulario), nombre = VALUES(nombre), descripcion = VALUES(descripcion), tipo = VALUES(tipo), activo = VALUES(activo), created_at = VALUES(created_at);

COMMIT;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- End migration
