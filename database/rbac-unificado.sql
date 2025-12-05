-- ==========================================
-- ELECTROTECH - SISTEMA RBAC UNIFICADO
-- ==========================================
-- Script completo de RBAC con todos los módulos:
--   1. Piezas y Pinturas
--   2. Facturación
--   3. Reportes
--   4. Administración
--   5. Empleados y Nómina
--   6. Maquinarias
-- Fecha: 2025-12-05
-- ==========================================

USE electrotech2;

SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- LIMPIEZA PREVIA (opcional - descomentar si necesitas reinstalar)
-- ==========================================
-- DELETE FROM GrupoComponente;
-- DELETE FROM Componente;
-- DELETE FROM Formulario;
-- DELETE FROM Modulo;

-- ==========================================
-- MÓDULOS
-- ==========================================

INSERT INTO Modulo (id_modulo, nombre, descripcion, icono, orden, activo) VALUES
(1, 'Piezas y Pinturas', 'Gestión de piezas, pinturas y producción', 'package', 1, 1),
(2, 'Facturación', 'Facturas, remitos y clientes', 'receipt', 2, 1),
(3, 'Reportes', 'Reportes y estadísticas del sistema', 'chart-bar', 3, 1),
(4, 'Administración', 'Configuración y permisos', 'settings', 4, 1),
(5, 'Empleados y Nómina', 'Gestión de empleados, asistencia y recibos de sueldo', 'users', 5, 1),
(6, 'Maquinarias', 'Gestión de cabinas, pistolas y hornos', 'settings-2', 6, 1)
ON DUPLICATE KEY UPDATE 
  nombre=VALUES(nombre), descripcion=VALUES(descripcion), icono=VALUES(icono), orden=VALUES(orden);

-- ==========================================
-- FORMULARIOS
-- ==========================================

-- Módulo 1: Piezas y Pinturas
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(1, 1, 'Gestión de Piezas', '/piezas', 1),
(2, 1, 'Gestión de Pinturas', '/pinturas', 2),
(3, 1, 'Piezas Pintadas', '/piezas-pintadas', 3),
(4, 1, 'Calculadora de Consumo', '/pinturas/calculadora', 4)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

-- Módulo 2: Facturación
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(5, 2, 'Remitos', '/remitos', 1),
(6, 2, 'Facturación', '/facturacion', 2),
(7, 2, 'Clientes', '/clientes', 3)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

-- Módulo 3: Reportes (simplificado - todos en /reportes)
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(15, 3, 'Reportes Principal', '/reportes', 0)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

-- Módulo 4: Administración
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(14, 4, 'Usuarios', '/dashboard/usuarios', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

-- Módulo 5: Empleados y Nómina
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(16, 5, 'Gestión de Empleados', '/dashboard/empleados', 1),
(17, 5, 'Asistencia Empleado', '/dashboard/empleados/[id]/asistencia', 2),
(18, 5, 'Recibos Empleado', '/dashboard/empleados/[id]/recibos', 3),
(19, 5, 'Gestión de Recibos', '/dashboard/recibos', 4)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

-- Módulo 6: Maquinarias
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(20, 6, 'Gestión de Maquinarias', '/dashboard/maquinarias', 1),
(21, 6, 'Reportes Maquinarias Principal', '/reportes/maquinarias', 2),
(22, 6, 'Reporte Uso Cabinas', '/reportes/maquinarias/uso-cabinas', 3),
(23, 6, 'Reporte Productividad Diaria', '/reportes/maquinarias/productividad-diaria', 4),
(24, 6, 'Reporte Mantenimiento Pistolas', '/reportes/maquinarias/mantenimiento-pistolas', 5),
(25, 6, 'Reporte Mantenimiento Hornos', '/reportes/maquinarias/mantenimiento-hornos', 6),
(26, 6, 'Reporte Consumo Gas', '/reportes/maquinarias/consumo-gas', 7)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), ruta=VALUES(ruta);

-- ==========================================
-- COMPONENTES - MÓDULO 1: PIEZAS Y PINTURAS
-- ==========================================

-- Piezas (id_formulario=1)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(1, 1, 'Formulario Nueva Pieza', 'formulario'),
(2, 1, 'Tabla Listado Piezas', 'tabla'),
(3, 1, 'Botón Editar Pieza', 'boton'),
(4, 1, 'Botón Eliminar Pieza', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- Pinturas (id_formulario=2)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(5, 2, 'Formulario Nueva Pintura', 'formulario'),
(6, 2, 'Tabla Listado Pinturas', 'tabla'),
(7, 2, 'Botón Eliminar Pintura', 'boton'),
(24, 2, 'Botón Editar Pintura', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- Piezas Pintadas (id_formulario=3)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(8, 3, 'Formulario Registrar Producción', 'formulario'),
(9, 3, 'Tabla Historial Producción', 'tabla'),
(23, 3, 'Botón Eliminar Pieza Pintada', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- ==========================================
-- COMPONENTES - MÓDULO 2: FACTURACIÓN
-- ==========================================

-- Remitos (id_formulario=5)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(10, 5, 'Formulario Cargar Remito', 'formulario'),
(11, 5, 'Tabla Listado Remitos', 'tabla'),
(12, 5, 'Botón Ver Detalle', 'boton'),
(13, 5, 'Botón Imprimir PDF', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- Facturación (id_formulario=6)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(14, 6, 'Formulario Generar Factura', 'formulario'),
(15, 6, 'Tabla Listado Facturas', 'tabla'),
(16, 6, 'Botón Ver Detalle Factura', 'boton'),
(17, 6, 'Botón Imprimir Factura', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- ==========================================
-- COMPONENTES - MÓDULO 3: REPORTES
-- ==========================================

-- Reportes Principal (id_formulario=15) - Todos los reportes como hijos
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(29, 15, 'Página Principal Reportes', 'acceso'),
(18, 15, 'Acceso Participación Clientes', 'acceso'),
(19, 15, 'Acceso Pintura Más Utilizada', 'acceso'),
(20, 15, 'Acceso Ventas por Cliente', 'acceso'),
(21, 15, 'Acceso Evolución de Ventas', 'acceso'),
(22, 15, 'Acceso Consumo Pintura por Mes', 'acceso'),
(27, 15, 'Acceso Ventas Cliente Específico', 'acceso')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), id_formulario=VALUES(id_formulario), tipo=VALUES(tipo);

-- ==========================================
-- COMPONENTES - MÓDULO 5: EMPLEADOS Y NÓMINA
-- ==========================================

-- Gestión de Empleados (id_formulario=16)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(70, 16, 'Acceso Gestión Empleados', 'acceso'),
(71, 16, 'Formulario Nuevo Empleado', 'formulario'),
(72, 16, 'Tabla Listado Empleados', 'tabla'),
(73, 16, 'Botón Editar Empleado', 'boton'),
(74, 16, 'Botón Desactivar Empleado', 'boton'),
(75, 16, 'Botón Ver Asistencia', 'boton'),
(76, 16, 'Botón Ver Recibos', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- Asistencia Empleado (id_formulario=17)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(77, 17, 'Acceso Asistencia Empleado', 'acceso'),
(78, 17, 'Calendario Asistencia', 'otro'),
(79, 17, 'Botón Auto-cargar Asistencias', 'boton'),
(80, 17, 'Formulario Registrar Asistencia', 'formulario')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- Recibos Empleado (id_formulario=18)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(81, 18, 'Acceso Recibos Empleado', 'acceso'),
(82, 18, 'Tabla Historial Recibos', 'tabla'),
(83, 18, 'Botón Generar Recibo', 'boton'),
(84, 18, 'Botón Ver Detalle Recibo', 'boton'),
(85, 18, 'Botón Descargar PDF', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- Gestión de Recibos (id_formulario=19)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(86, 19, 'Acceso Gestión Recibos', 'acceso'),
(87, 19, 'Tabla Todos los Recibos', 'tabla'),
(88, 19, 'Botón Generar Recibos Masivo', 'boton'),
(89, 19, 'Botón Ver Recibo Individual', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- ==========================================
-- COMPONENTES - MÓDULO 6: MAQUINARIAS
-- ==========================================

-- Gestión de Maquinarias (id_formulario=20)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(90, 20, 'Acceso Gestión Maquinarias', 'acceso'),
(91, 20, 'Tab Cabinas', 'seccion'),
(92, 20, 'Tab Pistolas', 'seccion'),
(93, 20, 'Tab Hornos', 'seccion'),
(94, 20, 'Ver Cards Cabinas', 'otro'),
(95, 20, 'Ver Cards Pistolas', 'otro'),
(96, 20, 'Ver Cards Hornos', 'otro'),
(97, 20, 'Formulario Nueva Cabina', 'formulario'),
(98, 20, 'Formulario Nueva Pistola', 'formulario'),
(99, 20, 'Formulario Nuevo Horno', 'formulario'),
(100, 20, 'Botón Editar Cabina', 'boton'),
(101, 20, 'Botón Editar Pistola', 'boton'),
(102, 20, 'Botón Editar Horno', 'boton'),
(103, 20, 'Botón Eliminar Cabina', 'boton'),
(104, 20, 'Botón Eliminar Pistola', 'boton'),
(105, 20, 'Botón Eliminar Horno', 'boton'),
(106, 20, 'Botón Registrar Mantenimiento Pistola', 'boton'),
(107, 20, 'Botón Registrar Mantenimiento Horno', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- Reportes de Maquinarias
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(108, 21, 'Acceso Reportes Maquinarias', 'acceso'),
(109, 22, 'Acceso Reporte Uso Cabinas', 'acceso'),
(110, 23, 'Acceso Reporte Productividad Diaria', 'acceso'),
(111, 24, 'Acceso Reporte Mantenimiento Pistolas', 'acceso'),
(112, 25, 'Acceso Reporte Mantenimiento Hornos', 'acceso'),
(113, 26, 'Acceso Reporte Consumo Gas', 'acceso')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), tipo=VALUES(tipo);

-- ==========================================
-- ESTADOS DE GRUPO Y GRUPO ADMIN
-- ==========================================

INSERT INTO EstadoGrupo (id_estado, nombre) VALUES
(1, 'Activo'),
(2, 'Inactivo')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO Grupo (id_grupo, nombre, id_estado) VALUES
(1, 'Admin', 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ==========================================
-- ASIGNAR TODOS LOS PERMISOS A ADMIN
-- ==========================================

INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente)
SELECT 1, id_componente FROM Componente;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

SELECT 
    '✅ RBAC Unificado ejecutado correctamente' AS Status,
    (SELECT COUNT(*) FROM Modulo) AS Modulos,
    (SELECT COUNT(*) FROM Formulario) AS Formularios,
    (SELECT COUNT(*) FROM Componente) AS Componentes,
    (SELECT COUNT(*) FROM GrupoComponente WHERE id_grupo = 1) AS Permisos_Admin;

-- Mostrar estructura por módulo
SELECT 
    m.id_modulo,
    m.nombre AS Modulo,
    COUNT(DISTINCT f.id_formulario) AS Formularios,
    COUNT(DISTINCT c.id_componente) AS Componentes
FROM Modulo m
LEFT JOIN Formulario f ON f.id_modulo = m.id_modulo
LEFT JOIN Componente c ON c.id_formulario = f.id_formulario
GROUP BY m.id_modulo, m.nombre
ORDER BY m.orden;

