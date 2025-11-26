-- ==========================================
-- SISTEMA RBAC (Role-Based Access Control)
-- Script Completo y Unificado
-- ==========================================
-- Este script contiene:
-- 1. Schema completo de RBAC
-- 2. Datos iniciales (módulos, formularios, componentes)
-- 3. Componentes adicionales agregados durante migración
-- 4. Permisos para grupo Admin
-- 5. Vistas útiles
-- ==========================================

-- Deshabilitar verificación de llaves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- LIMPIEZA (solo si necesitas reinstalar)
-- ==========================================
-- Descomentar estas líneas solo si necesitas limpiar todo

-- DROP VIEW IF EXISTS v_permisos_grupo;
-- DROP VIEW IF EXISTS v_estructura_permisos;
-- DROP TABLE IF EXISTS GrupoComponente;
-- DROP TABLE IF EXISTS Componente;
-- DROP TABLE IF EXISTS Formulario;
-- DROP TABLE IF EXISTS Modulo;

-- ==========================================
-- ESTRUCTURA DE TABLAS
-- ==========================================

-- Módulos del sistema
CREATE TABLE IF NOT EXISTS Modulo (
  id_modulo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(50),
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Formularios dentro de módulos
CREATE TABLE IF NOT EXISTS Formulario (
  id_formulario INT AUTO_INCREMENT PRIMARY KEY,
  id_modulo INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  ruta VARCHAR(200) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(50),
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_modulo) REFERENCES Modulo(id_modulo) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Componentes dentro de formularios
CREATE TABLE IF NOT EXISTS Componente (
  id_componente INT AUTO_INCREMENT PRIMARY KEY,
  id_formulario INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo ENUM('boton', 'tabla', 'formulario', 'seccion', 'acceso', 'otro') DEFAULT 'otro',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_formulario) REFERENCES Formulario(id_formulario) ON DELETE CASCADE,
  UNIQUE KEY uk_componente (id_formulario, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Relación Grupo -> Componente (permisos)
CREATE TABLE IF NOT EXISTS GrupoComponente (
  id_grupo INT NOT NULL,
  id_componente INT NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_grupo, id_componente),
  FOREIGN KEY (id_grupo) REFERENCES Grupo(id_grupo) ON DELETE CASCADE,
  FOREIGN KEY (id_componente) REFERENCES Componente(id_componente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reactivar verificación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- MÓDULOS
-- ==========================================

INSERT INTO Modulo (id_modulo, nombre, descripcion, icono, orden) VALUES
(1, 'Piezas y Pinturas', 'Gestión de piezas, pinturas y producción', 'package', 1),
(2, 'Facturación', 'Facturas, remitos y clientes', 'receipt', 2),
(3, 'Reportes', 'Reportes y estadísticas del sistema', 'chart-bar', 3),
(4, 'Administración', 'Configuración y permisos', 'settings', 4)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ==========================================
-- FORMULARIOS
-- ==========================================

-- Módulo Piezas y Pinturas (id_modulo=1)
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(1, 1, 'Gestión de Piezas', '/piezas', 1),
(2, 1, 'Gestión de Pinturas', '/pinturas', 2),
(3, 1, 'Piezas Pintadas', '/piezas-pintadas', 3),
(4, 1, 'Calculadora de Consumo', '/pinturas/calculadora', 4)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Módulo Facturación (id_modulo=2)
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(5, 2, 'Remitos', '/remitos', 1),
(6, 2, 'Facturación', '/facturacion', 2),
(7, 2, 'Clientes', '/clientes', 3)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Módulo Reportes (id_modulo=3)
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(8, 3, 'Participación Clientes', '/reportes/clientes', 1),
(9, 3, 'Pintura Más Utilizada', '/reportes/pintura-mas-utilizada', 2),
(10, 3, 'Ventas por Cliente', '/reportes/ventas-por-cliente', 3),
(11, 3, 'Evolución de Ventas', '/reportes/evolucion-ventas', 4),
(12, 3, 'Consumo Pintura por Mes', '/reportes/pintura-por-mes', 5),
(13, 3, 'Ventas Cliente Específico', '/reportes/ventas-cliente-especifico', 6)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Módulo Administración (id_modulo=4)
INSERT INTO Formulario (id_formulario, id_modulo, nombre, ruta, orden) VALUES
(14, 4, 'Usuarios', '/dashboard/usuarios', 1),
(15, 4, 'Grupos', '/dashboard/grupos', 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ==========================================
-- COMPONENTES
-- ==========================================

-- Componentes para Piezas (id_formulario=1)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(1, 1, 'Formulario Nueva Pieza', 'formulario'),
(2, 1, 'Tabla Listado Piezas', 'tabla'),
(3, 1, 'Botón Editar Pieza', 'boton'),
(4, 1, 'Botón Eliminar Pieza', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Componentes para Pinturas (id_formulario=2)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(5, 2, 'Formulario Nueva Pintura', 'formulario'),
(6, 2, 'Tabla Listado Pinturas', 'tabla'),
(7, 2, 'Botón Eliminar Pintura', 'boton'),
(24, 2, 'Botón Editar Pintura', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Componentes para Piezas Pintadas (id_formulario=3)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(8, 3, 'Formulario Registrar Producción', 'formulario'),
(9, 3, 'Tabla Historial Producción', 'tabla'),
(23, 3, 'Botón Eliminar Pieza Pintada', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Componentes para Remitos (id_formulario=5)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(10, 5, 'Formulario Cargar Remito', 'formulario'),
(11, 5, 'Tabla Listado Remitos', 'tabla'),
(12, 5, 'Botón Ver Detalle', 'boton'),
(13, 5, 'Botón Imprimir PDF', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Componentes para Facturación (id_formulario=6)
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(14, 6, 'Formulario Generar Factura', 'formulario'),
(15, 6, 'Tabla Listado Facturas', 'tabla'),
(16, 6, 'Botón Ver Detalle Factura', 'boton'),
(17, 6, 'Botón Imprimir Factura', 'boton')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Componentes para Reportes (tipo 'acceso')
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(18, 8, 'Acceso Participación Clientes', 'acceso'),
(19, 9, 'Acceso Pintura Más Utilizada', 'acceso'),
(20, 10, 'Acceso Ventas por Cliente', 'acceso'),
(21, 11, 'Acceso Evolución de Ventas', 'acceso'),
(22, 12, 'Acceso Consumo Pintura por Mes', 'acceso'),
(27, 13, 'Acceso Ventas Cliente Específico', 'acceso')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ==========================================
-- PERMISOS ADMIN
-- ==========================================
-- Asegurar que Admin (id_grupo=1) tiene TODOS los componentes

INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente)
SELECT 1, id_componente FROM Componente;

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista: Estructura completa de permisos
CREATE OR REPLACE VIEW v_estructura_permisos AS
SELECT 
  m.id_modulo,
  m.nombre AS modulo,
  f.id_formulario,
  f.nombre AS formulario,
  f.ruta,
  c.id_componente,
  c.nombre AS componente,
  c.tipo AS tipo_componente
FROM Modulo m
JOIN Formulario f ON f.id_modulo = m.id_modulo
JOIN Componente c ON c.id_formulario = f.id_formulario
WHERE m.activo = TRUE AND f.activo = TRUE AND c.activo = TRUE
ORDER BY m.orden, f.orden, c.id_componente;

-- Vista: Permisos por grupo
CREATE OR REPLACE VIEW v_permisos_grupo AS
SELECT 
  g.id_grupo,
  g.nombre AS grupo,
  m.nombre AS modulo,
  f.nombre AS formulario,
  f.ruta,
  c.id_componente,
  c.nombre AS componente,
  c.tipo AS tipo_componente,
  gc.fecha_asignacion
FROM Grupo g
JOIN GrupoComponente gc ON gc.id_grupo = g.id_grupo
JOIN Componente c ON c.id_componente = gc.id_componente
JOIN Formulario f ON f.id_formulario = c.id_formulario
JOIN Modulo m ON m.id_modulo = f.id_modulo
ORDER BY g.nombre, m.orden, f.orden;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

SELECT 
    '✅ Script ejecutado correctamente' AS Status,
    COUNT(DISTINCT m.id_modulo) AS Total_Modulos,
    COUNT(DISTINCT f.id_formulario) AS Total_Formularios,
    COUNT(DISTINCT c.id_componente) AS Total_Componentes,
    COUNT(DISTINCT gc.id_componente) AS Componentes_Admin
FROM Modulo m
JOIN Formulario f ON f.id_modulo = m.id_modulo
JOIN Componente c ON c.id_formulario = f.id_formulario
LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente AND gc.id_grupo = 1;

-- Mostrar estructura completa
SELECT 
    m.nombre AS Modulo,
    f.nombre AS Formulario,
    f.ruta AS Ruta,
    c.id_componente AS ID,
    c.nombre AS Componente,
    c.tipo AS Tipo,
    CASE WHEN gc.id_grupo = 1 THEN '✅' ELSE '❌' END AS Admin
FROM Modulo m
JOIN Formulario f ON f.id_modulo = m.id_modulo
JOIN Componente c ON c.id_formulario = f.id_formulario
LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente AND gc.id_grupo = 1
ORDER BY m.id_modulo, f.orden, c.id_componente;
