-- ==========================================
-- ELECTROTECH - RESET Y REPOBLADO DE DATOS
-- ==========================================
-- Este script elimina y recrea datos de producción
-- manteniendo intactos los datos de RBAC
-- Fecha: 2025-12-01
-- ==========================================

USE electrotech2;

-- ==========================================
-- DESACTIVAR VALIDACIONES TEMPORALMENTE
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- ==========================================
-- ELIMINAR TRIGGERS ANTIGUOS
-- ==========================================
DROP TRIGGER IF EXISTS after_piezapintada_insert;
DROP TRIGGER IF EXISTS trg_piezapintada_insert;
DROP TRIGGER IF EXISTS tr_after_piezapintada_insert;

-- ==========================================
-- FASE 1: ELIMINACIÓN DE DATOS
-- ==========================================
-- Orden: de tablas dependientes hacia tablas base

-- 1. Eliminar datos de facturas (más dependientes)
DELETE FROM facturadetalle;
DELETE FROM factura;

-- 2. Eliminar datos de remitos
DELETE FROM remitodetalle;
DELETE FROM remito;

-- 3. Eliminar historial y equipos de cabinas
DELETE FROM alertasmaquinaria;
DELETE FROM cabinahistorial;
DELETE FROM cabinapistola;
DELETE FROM cabinahorno;
DELETE FROM cabina;
DELETE FROM pistola;
DELETE FROM horno;

-- 4. Eliminar empleados y relacionados
DELETE FROM salario;
DELETE FROM asistencia;
DELETE FROM empleado;

-- 5. Eliminar piezas pintadas y stock
DELETE FROM piezapintada;
DELETE FROM stockpieza;

-- 6. Eliminar pinturas y relaciones
DELETE FROM proveedorpintura;
DELETE FROM pintura;

-- 7. Eliminar catálogos de pintura
DELETE FROM tipopintura;
DELETE FROM color;
DELETE FROM marca;

-- 8. Eliminar proveedores
DELETE FROM proveedor;

-- 9. Eliminar piezas
DELETE FROM pieza;

-- 10. Eliminar clientes
DELETE FROM cliente;

-- ==========================================
-- REINICIAR AUTO_INCREMENT
-- ==========================================
ALTER TABLE cliente AUTO_INCREMENT = 1;
ALTER TABLE proveedor AUTO_INCREMENT = 1;
ALTER TABLE pieza AUTO_INCREMENT = 1;
ALTER TABLE stockpieza AUTO_INCREMENT = 1;
ALTER TABLE marca AUTO_INCREMENT = 1;
ALTER TABLE color AUTO_INCREMENT = 1;
ALTER TABLE tipopintura AUTO_INCREMENT = 1;
ALTER TABLE pintura AUTO_INCREMENT = 1;
ALTER TABLE piezapintada AUTO_INCREMENT = 1;
ALTER TABLE remito AUTO_INCREMENT = 1;
ALTER TABLE remitodetalle AUTO_INCREMENT = 1;
ALTER TABLE factura AUTO_INCREMENT = 1;
ALTER TABLE facturadetalle AUTO_INCREMENT = 1;
ALTER TABLE empleado AUTO_INCREMENT = 1;
ALTER TABLE salario AUTO_INCREMENT = 1;
ALTER TABLE cabina AUTO_INCREMENT = 1;
ALTER TABLE pistola AUTO_INCREMENT = 1;
ALTER TABLE horno AUTO_INCREMENT = 1;
ALTER TABLE cabinahistorial AUTO_INCREMENT = 1;
ALTER TABLE alertasmaquinaria AUTO_INCREMENT = 1;

-- ==========================================
-- FASE 2: INSERCIÓN DE NUEVOS DATOS
-- (FOREIGN_KEY_CHECKS permanece desactivado hasta el final)
-- ==========================================

-- ==========================================
-- 1. CLIENTES
-- ==========================================
INSERT INTO cliente (nombre, direccion) VALUES
('AutoParts SA', 'Av. Industrial 1234, Buenos Aires'),
('Metalúrgica del Sur', 'Calle 50 N° 890, La Plata'),
('Industrias del Norte', 'Ruta 9 Km 45, Rosario'),
('Fábrica Central', 'Av. Libertador 2500, Córdoba'),
('Componentes Tech', 'Parque Industrial Zona 3, Mendoza');

-- ==========================================
-- 2. PROVEEDORES
-- ==========================================
INSERT INTO proveedor (nombre, direccion) VALUES
('Pinturas del Plata', 'Av. Mitre 5678, CABA'),
('Colores Industriales', 'Parque Industrial Sur, Quilmes'),
('Recubrimientos Premium', 'Zona Franca, Tucumán');

-- ==========================================
-- 3. CATÁLOGOS DE PINTURA
-- ==========================================

-- Marcas
INSERT INTO marca (nombre) VALUES
('WEG'),
('LAP');

-- Colores
INSERT INTO color (nombre) VALUES
('Negro'),
('Blanco'),
('Gris'),
('Azul'),
('Rojo'),
('Verde'),
('Amarillo'),
('Naranja'),
('Plateado'),
('Beige');

-- Tipos de Pintura (Pintura en Polvo)
INSERT INTO tipopintura (nombre) VALUES
('Brillante'),
('Mate'),
('Semi Mate'),
('Texturado'),
('Texturado Fino'),
('Texturado Grueso');

-- ==========================================
-- 4. PINTURAS
-- ==========================================
-- Formato: (id_marca, id_color, id_tipo, id_proveedor, cantidad_kg, precio_unitario)

INSERT INTO pintura (id_marca, id_color, id_tipo, id_proveedor, cantidad_kg, precio_unitario) VALUES
-- WEG - Brillante
(1, 1, 1, 1, 500.00, 75.50), -- Negro Brillante
(1, 2, 1, 1, 600.00, 72.00), -- Blanco Brillante
(1, 3, 1, 2, 450.00, 74.00), -- Gris Brillante
(1, 4, 1, 1, 400.00, 76.00), -- Azul Brillante
(1, 5, 1, 2, 350.00, 78.00), -- Rojo Brillante

-- WEG - Mate
(1, 1, 2, 2, 550.00, 73.00), -- Negro Mate
(1, 2, 2, 1, 500.00, 71.00), -- Blanco Mate
(1, 6, 2, 3, 400.00, 74.50), -- Verde Mate
(1, 7, 2, 2, 350.00, 75.00), -- Amarillo Mate

-- WEG - Semi Mate
(1, 3, 3, 2, 450.00, 72.50), -- Gris Semi Mate
(1, 8, 3, 3, 300.00, 77.00), -- Naranja Semi Mate
(1, 9, 3, 1, 380.00, 79.00), -- Plateado Semi Mate

-- WEG - Texturado
(1, 1, 4, 2, 400.00, 80.00), -- Negro Texturado
(1, 10, 4, 3, 350.00, 76.50), -- Beige Texturado

-- LAP - Brillante
(2, 1, 1, 1, 550.00, 74.00), -- Negro Brillante
(2, 2, 1, 2, 580.00, 70.50), -- Blanco Brillante
(2, 4, 1, 3, 420.00, 75.50), -- Azul Brillante
(2, 5, 1, 1, 380.00, 77.50), -- Rojo Brillante

-- LAP - Mate
(2, 3, 2, 2, 500.00, 72.00), -- Gris Mate
(2, 6, 2, 3, 430.00, 73.50), -- Verde Mate
(2, 7, 2, 1, 360.00, 74.00), -- Amarillo Mate

-- LAP - Texturado Fino
(2, 1, 5, 2, 450.00, 81.00), -- Negro Texturado Fino
(2, 3, 5, 3, 400.00, 79.50), -- Gris Texturado Fino

-- LAP - Texturado Grueso
(2, 10, 6, 1, 380.00, 78.00), -- Beige Texturado Grueso
(2, 8, 6, 2, 320.00, 80.50); -- Naranja Texturado Grueso

-- ==========================================
-- 5. RELACIÓN PROVEEDOR-PINTURA
-- ==========================================
INSERT INTO proveedorpintura (id_proveedor, id_pintura) VALUES
-- Proveedor 1 (Pinturas del Plata)
(1, 1), (1, 2), (1, 4), (1, 7), (1, 12),
(1, 15), (1, 18), (1, 21), (1, 24),
-- Proveedor 2 (Colores Industriales)
(2, 3), (2, 5), (2, 6), (2, 9), (2, 10),
(2, 13), (2, 16), (2, 19), (2, 22), (2, 25),
-- Proveedor 3 (Recubrimientos Premium)
(3, 8), (3, 11), (3, 14), (3, 17), (3, 20),
(3, 23);

-- ==========================================
-- 6. PIEZAS POR CLIENTE
-- ==========================================
-- Formato: (id_cliente, ancho_m, alto_m, detalle)

-- AutoParts SA
INSERT INTO pieza (id_cliente, ancho_m, alto_m, detalle) VALUES
(1, 0.50, 0.30, 'Tapa de motor pequeña'),
(1, 0.80, 0.60, 'Panel lateral derecho'),
(1, 0.80, 0.60, 'Panel lateral izquierdo'),
(1, 1.20, 0.40, 'Capot delantero'),

-- Metalúrgica del Sur
(2, 1.50, 1.00, 'Puerta industrial tipo A'),
(2, 1.50, 1.00, 'Puerta industrial tipo B'),
(2, 2.00, 1.50, 'Panel estructural grande'),

-- Industrias del Norte
(3, 0.60, 0.40, 'Soporte metálico reforzado'),
(3, 0.90, 0.70, 'Base de maquinaria'),
(3, 1.00, 0.80, 'Cubierta protectora'),

-- Fábrica Central
(4, 0.40, 0.30, 'Componente pequeño A'),
(4, 0.40, 0.30, 'Componente pequeño B'),
(4, 1.10, 0.90, 'Estructura mediana'),

-- Componentes Tech
(5, 0.70, 0.50, 'Carcasa electrónica'),
(5, 1.30, 1.00, 'Panel de control');

-- ==========================================
-- 7. REMITOS (RECEPCIÓN DE PIEZAS)
-- ==========================================
-- Estos remitos crearán automáticamente el stock mediante el trigger

-- ========== SEPTIEMBRE 2025 ==========

-- Remito 1: AutoParts SA (Septiembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(1, '2025-09-02 08:30:00', 300);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(1, 1, 80), -- Tapa de motor: 80 unidades
(1, 2, 70), -- Panel lateral derecho: 70
(1, 3, 70), -- Panel lateral izquierdo: 70
(1, 4, 80); -- Capot delantero: 80

-- Remito 2: Metalúrgica del Sur (Septiembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(2, '2025-09-05 09:00:00', 180);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(2, 5, 60), -- Puerta tipo A: 60
(2, 6, 60), -- Puerta tipo B: 60
(2, 7, 60); -- Panel estructural: 60

-- Remito 3: Industrias del Norte (Septiembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(3, '2025-09-10 10:15:00', 200);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(3, 8, 80),  -- Soporte metálico: 80
(3, 9, 60),  -- Base de maquinaria: 60
(3, 10, 60); -- Cubierta protectora: 60

-- ========== OCTUBRE 2025 ==========

-- Remito 4: Fábrica Central (Octubre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(4, '2025-10-03 11:00:00', 250);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(4, 11, 100), -- Componente pequeño A: 100
(4, 12, 100), -- Componente pequeño B: 100
(4, 13, 50);  -- Estructura mediana: 50

-- Remito 5: Componentes Tech (Octubre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(5, '2025-10-07 08:45:00', 140);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(5, 14, 70), -- Carcasa electrónica: 70
(5, 15, 70); -- Panel de control: 70

-- Remito 6: AutoParts SA (Octubre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(1, '2025-10-12 09:30:00', 280);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(6, 1, 70),  -- Tapa de motor: 70
(6, 2, 70),  -- Panel lateral derecho: 70
(6, 3, 70),  -- Panel lateral izquierdo: 70
(6, 4, 70);  -- Capot delantero: 70

-- Remito 7: Metalúrgica del Sur (Octubre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(2, '2025-10-18 10:00:00', 150);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(7, 5, 50),  -- Puerta tipo A: 50
(7, 6, 50),  -- Puerta tipo B: 50
(7, 7, 50);  -- Panel estructural: 50

-- ========== NOVIEMBRE 2025 ==========

-- Remito 8: AutoParts SA (Noviembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(1, '2025-11-01 08:30:00', 350);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(8, 1, 100), -- Tapa de motor: 100 unidades
(8, 2, 80),  -- Panel lateral derecho: 80
(8, 3, 80),  -- Panel lateral izquierdo: 80
(8, 4, 90);  -- Capot delantero: 90

-- Remito 9: Industrias del Norte (Noviembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(3, '2025-11-05 10:15:00', 250);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(9, 8, 100), -- Soporte metálico: 100
(9, 9, 80),  -- Base de maquinaria: 80
(9, 10, 70); -- Cubierta protectora: 70

-- Remito 10: Fábrica Central (Noviembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(4, '2025-11-08 11:00:00', 300);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(10, 11, 120), -- Componente pequeño A: 120
(10, 12, 120), -- Componente pequeño B: 120
(10, 13, 60);  -- Estructura mediana: 60

-- Remito 11: Metalúrgica del Sur (Noviembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(2, '2025-11-12 09:00:00', 200);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(11, 5, 70),  -- Puerta tipo A: 70
(11, 6, 70),  -- Puerta tipo B: 70
(11, 7, 60);  -- Panel estructural: 60

-- Remito 12: Componentes Tech (Noviembre)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(5, '2025-11-18 08:45:00', 150);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(12, 14, 80), -- Carcasa electrónica: 80
(12, 15, 70); -- Panel de control: 70

-- Remito 13: AutoParts SA (Noviembre - Segunda entrega)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(1, '2025-11-22 09:00:00', 260);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(13, 1, 70),  -- Tapa de motor: 70
(13, 2, 60),  -- Panel lateral derecho: 60
(13, 3, 60),  -- Panel lateral izquierdo: 60
(13, 4, 70);  -- Capot delantero: 70

-- Remito 14: Industrias del Norte (Noviembre - Segunda entrega)
INSERT INTO remito (id_cliente, fecha_recepcion, cantidad_piezas) VALUES
(3, '2025-11-25 10:30:00', 220);

INSERT INTO remitodetalle (id_remito, id_pieza, cantidad) VALUES
(14, 8, 90),  -- Soporte metálico: 90
(14, 9, 70),  -- Base de maquinaria: 70
(14, 10, 60); -- Cubierta protectora: 60

-- ==========================================
-- 8. PIEZAS PINTADAS
-- ==========================================
-- Estos registros validarán stock disponible y consumo de pintura mediante trigger
-- Formato: (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg)

-- ========== SEPTIEMBRE 2025 ==========

-- Pintado de piezas de AutoParts SA (Septiembre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(1, 6, 40, '2025-09-05', 3.000),   -- Tapa motor Negro Mate
(2, 3, 35, '2025-09-06', 8.400),   -- Panel derecho Gris Brillante
(3, 3, 35, '2025-09-06', 8.400),   -- Panel izquierdo Gris Brillante
(4, 2, 40, '2025-09-07', 9.600);   -- Capot Blanco Brillante

-- Pintado de piezas de Metalúrgica del Sur (Septiembre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(5, 4, 30, '2025-09-10', 22.500),  -- Puerta tipo A Azul Brillante
(6, 4, 30, '2025-09-10', 22.500),  -- Puerta tipo B Azul Brillante
(7, 19, 30, '2025-09-12', 45.000); -- Panel estructural Gris Mate LAP

-- Pintado de piezas de Industrias del Norte (Septiembre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(8, 8, 40, '2025-09-15', 6.720),   -- Soporte Verde Mate
(9, 6, 30, '2025-09-16', 9.450),   -- Base Negro Mate
(10, 12, 30, '2025-09-18', 12.000); -- Cubierta Plateado Semi Mate

-- ========== OCTUBRE 2025 ==========

-- Pintado de piezas de Fábrica Central (Octubre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(11, 15, 50, '2025-10-05', 3.000),  -- Componente A Negro Brillante LAP
(12, 15, 50, '2025-10-05', 3.000),  -- Componente B Negro Brillante LAP
(13, 16, 25, '2025-10-07', 12.375); -- Estructura Blanco Brillante LAP

-- Pintado de piezas de Componentes Tech (Octubre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(14, 9, 35, '2025-10-10', 6.125),  -- Carcasa Amarillo Mate
(15, 17, 35, '2025-10-12', 22.750); -- Panel control Azul Brillante LAP

-- Pintado de piezas de AutoParts SA (Octubre - Segunda producción)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(1, 1, 35, '2025-10-15', 2.625),   -- Tapa motor Negro Brillante
(2, 10, 35, '2025-10-16', 8.400),  -- Panel derecho Gris Semi Mate
(3, 10, 35, '2025-10-16', 8.400),  -- Panel izquierdo Gris Semi Mate
(4, 7, 35, '2025-10-17', 8.400);   -- Capot Blanco Mate

-- Pintado de piezas de Metalúrgica del Sur (Octubre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(5, 17, 25, '2025-10-20', 18.750),  -- Puerta tipo A Azul Brillante LAP
(6, 17, 25, '2025-10-20', 18.750),  -- Puerta tipo B Azul Brillante LAP
(7, 10, 25, '2025-10-22', 37.500);  -- Panel estructural Gris Semi Mate

-- ========== NOVIEMBRE 2025 ==========

-- Pintado de piezas de AutoParts SA (Noviembre - Primera producción)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(1, 6, 50, '2025-11-02', 3.750),   -- Tapa motor Negro Mate
(2, 3, 40, '2025-11-03', 9.600),   -- Panel derecho Gris Brillante
(3, 3, 40, '2025-11-03', 9.600),   -- Panel izquierdo Gris Brillante
(4, 2, 45, '2025-11-04', 10.800);  -- Capot Blanco Brillante

-- Pintado de piezas de Industrias del Norte (Noviembre - Primera producción)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(8, 20, 50, '2025-11-07', 8.400),   -- Soporte Verde Mate LAP
(9, 15, 40, '2025-11-08', 12.600),  -- Base Negro Brillante LAP
(10, 12, 35, '2025-11-09', 14.000); -- Cubierta Plateado Semi Mate

-- Pintado de piezas de Fábrica Central (Noviembre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(11, 1, 60, '2025-11-12', 3.600),  -- Componente A Negro Brillante
(12, 1, 60, '2025-11-12', 3.600),  -- Componente B Negro Brillante
(13, 2, 30, '2025-11-13', 14.850); -- Estructura Blanco Brillante

-- Pintado de piezas de Metalúrgica del Sur (Noviembre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(5, 4, 35, '2025-11-15', 26.250),  -- Puerta tipo A Azul Brillante
(6, 4, 35, '2025-11-15', 26.250),  -- Puerta tipo B Azul Brillante
(7, 19, 30, '2025-11-16', 45.000); -- Panel estructural Gris Mate LAP

-- Pintado de piezas de Componentes Tech (Noviembre)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(14, 21, 40, '2025-11-19', 7.000),  -- Carcasa Amarillo Mate LAP
(15, 17, 35, '2025-11-20', 22.750); -- Panel control Azul Brillante LAP

-- Pintado de piezas de AutoParts SA (Noviembre - Segunda producción)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(1, 15, 35, '2025-11-23', 2.625),   -- Tapa motor Negro Brillante LAP
(2, 19, 30, '2025-11-24', 7.200),   -- Panel derecho Gris Mate LAP
(3, 19, 30, '2025-11-24', 7.200),   -- Panel izquierdo Gris Mate LAP
(4, 16, 35, '2025-11-25', 8.400);   -- Capot Blanco Brillante LAP

-- Pintado de piezas de Industrias del Norte (Noviembre - Segunda producción)
INSERT INTO piezapintada (id_pieza, id_pintura, cantidad, fecha, consumo_estimado_kg) VALUES
(8, 8, 45, '2025-11-26', 7.560),   -- Soporte Verde Mate
(9, 6, 35, '2025-11-27', 11.025),  -- Base Negro Mate
(10, 11, 30, '2025-11-28', 12.000); -- Cubierta Naranja Semi Mate

-- ==========================================
-- 9. FACTURAS
-- ==========================================

-- ========== SEPTIEMBRE 2025 ==========

-- Factura 1: AutoParts SA (Septiembre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(1, '2025-09-20 14:00:00', 130000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(1, 1, 40, 850.00),   -- Tapas de motor (id_pieza_pintada = 1)
(1, 2, 35, 1200.00),  -- Panel derecho
(1, 3, 35, 1200.00),  -- Panel izquierdo
(1, 4, 40, 1500.00);  -- Capot

UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 1;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 2;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 3;
UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 4;

-- Factura 2: Metalúrgica del Sur (Septiembre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(2, '2025-09-25 15:30:00', 210000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(2, 5, 30, 2800.00),  -- Puerta tipo A
(2, 6, 30, 2800.00),  -- Puerta tipo B
(2, 7, 30, 3500.00);  -- Panel estructural

UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 5;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 6;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 7;

-- Factura 3: Industrias del Norte (Septiembre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(3, '2025-09-28 16:00:00', 142000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(3, 8, 40, 950.00),   -- Soporte metálico
(3, 9, 30, 1600.00),  -- Base de maquinaria
(3, 10, 30, 1800.00); -- Cubierta

UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 8;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 9;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 10;

-- ========== OCTUBRE 2025 ==========

-- Factura 4: Fábrica Central (Octubre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(4, '2025-10-10 10:00:00', 110000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(4, 11, 50, 700.00),  -- Componente A
(4, 12, 50, 700.00),  -- Componente B
(4, 13, 25, 1800.00); -- Estructura

UPDATE piezapintada SET cantidad_facturada = 50 WHERE id_pieza_pintada = 11;
UPDATE piezapintada SET cantidad_facturada = 50 WHERE id_pieza_pintada = 12;
UPDATE piezapintada SET cantidad_facturada = 25 WHERE id_pieza_pintada = 13;

-- Factura 5: Componentes Tech (Octubre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(5, '2025-10-15 11:30:00', 95000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(5, 14, 35, 1100.00),  -- Carcasa electrónica
(5, 15, 35, 1600.00);  -- Panel de control

UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 14;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 15;

-- Factura 6: AutoParts SA (Octubre - Segunda factura)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(1, '2025-10-22 14:30:00', 126000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(6, 16, 35, 850.00),   -- Tapas de motor
(6, 17, 35, 1200.00),  -- Panel derecho
(6, 18, 35, 1200.00),  -- Panel izquierdo
(6, 19, 35, 1500.00);  -- Capot

UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 16;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 17;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 18;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 19;

-- Factura 7: Metalúrgica del Sur (Octubre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(2, '2025-10-28 15:00:00', 175000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(7, 20, 25, 2800.00),  -- Puerta tipo A
(7, 21, 25, 2800.00),  -- Puerta tipo B
(7, 22, 25, 3500.00);  -- Panel estructural

UPDATE piezapintada SET cantidad_facturada = 25 WHERE id_pieza_pintada = 20;
UPDATE piezapintada SET cantidad_facturada = 25 WHERE id_pieza_pintada = 21;
UPDATE piezapintada SET cantidad_facturada = 25 WHERE id_pieza_pintada = 22;

-- ========== NOVIEMBRE 2025 ==========

-- Factura 8: AutoParts SA (Noviembre - Primera factura)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(1, '2025-11-08 14:00:00', 155000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(8, 23, 50, 850.00),   -- Tapas de motor
(8, 24, 40, 1200.00),  -- Panel derecho
(8, 25, 40, 1200.00),  -- Panel izquierdo
(8, 26, 45, 1500.00);  -- Capot

UPDATE piezapintada SET cantidad_facturada = 50 WHERE id_pieza_pintada = 23;
UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 24;
UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 25;
UPDATE piezapintada SET cantidad_facturada = 45 WHERE id_pieza_pintada = 26;

-- Factura 9: Industrias del Norte (Noviembre - Primera factura)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(3, '2025-11-12 16:00:00', 180000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(9, 27, 50, 950.00),   -- Soporte metálico
(9, 28, 40, 1600.00),  -- Base de maquinaria
(9, 29, 35, 1800.00);  -- Cubierta

UPDATE piezapintada SET cantidad_facturada = 50 WHERE id_pieza_pintada = 27;
UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 28;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 29;

-- Factura 10: Fábrica Central (Noviembre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(4, '2025-11-16 10:00:00', 132000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(10, 30, 60, 700.00),  -- Componente A
(10, 31, 60, 700.00),  -- Componente B
(10, 32, 30, 1800.00); -- Estructura

UPDATE piezapintada SET cantidad_facturada = 60 WHERE id_pieza_pintada = 30;
UPDATE piezapintada SET cantidad_facturada = 60 WHERE id_pieza_pintada = 31;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 32;

-- Factura 11: Metalúrgica del Sur (Noviembre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(2, '2025-11-20 15:30:00', 245000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(11, 33, 35, 2800.00),  -- Puerta tipo A
(11, 34, 35, 2800.00),  -- Puerta tipo B
(11, 35, 30, 3500.00);  -- Panel estructural

UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 33;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 34;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 35;

-- Factura 12: Componentes Tech (Noviembre)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(5, '2025-11-22 11:30:00', 100000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(12, 36, 40, 1100.00),  -- Carcasa electrónica
(12, 37, 35, 1600.00);  -- Panel de control

UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 36;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 37;

-- Factura 13: AutoParts SA (Noviembre - Segunda factura)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(1, '2025-11-27 14:30:00', 115000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(13, 38, 35, 850.00),   -- Tapas de motor
(13, 39, 30, 1200.00),  -- Panel derecho
(13, 40, 30, 1200.00),  -- Panel izquierdo
(13, 41, 35, 1500.00);  -- Capot

UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 38;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 39;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 40;
UPDATE piezapintada SET cantidad_facturada = 35 WHERE id_pieza_pintada = 41;

-- Factura 14: Industrias del Norte (Noviembre - Segunda factura - Parcial)
INSERT INTO factura (id_cliente, fecha, total) VALUES
(3, '2025-11-29 16:30:00', 145000.00);

INSERT INTO facturadetalle (id_factura, id_pieza_pintada, cantidad, precio_unitario) VALUES
(14, 42, 40, 950.00),   -- Soporte metálico (40 de 45)
(14, 43, 30, 1600.00),  -- Base de maquinaria (30 de 35)
(14, 44, 25, 1800.00);  -- Cubierta (25 de 30)

UPDATE piezapintada SET cantidad_facturada = 40 WHERE id_pieza_pintada = 42;
UPDATE piezapintada SET cantidad_facturada = 30 WHERE id_pieza_pintada = 43;
UPDATE piezapintada SET cantidad_facturada = 25 WHERE id_pieza_pintada = 44;

-- ==========================================
-- 10. EMPLEADOS
-- ==========================================
INSERT INTO empleado (nombre, apellido, funcion) VALUES
('Juan', 'Pérez', 'Operario de Pintura'),
('María', 'González', 'Supervisora de Calidad'),
('Carlos', 'Rodríguez', 'Técnico de Maquinaria'),
('Ana', 'Martínez', 'Operaria de Pintura'),
('Luis', 'Fernández', 'Jefe de Producción');

-- ==========================================
-- 11. SALARIOS
-- ==========================================
INSERT INTO salario (id_empleado, salario_base, plus_presentismo) VALUES
(1, 180000.00, 20000.00),
(2, 250000.00, 25000.00),
(3, 220000.00, 22000.00),
(4, 180000.00, 20000.00),
(5, 300000.00, 30000.00);

-- ==========================================
-- 12. ASISTENCIA (Noviembre 2025)
-- ==========================================
-- Empleado 1: Juan Pérez (100% presente)
INSERT INTO asistencia (id_empleado, fecha, presente, es_justificada, justificacion) VALUES
(1, '2025-11-01', 1, 0, NULL),
(1, '2025-11-04', 1, 0, NULL),
(1, '2025-11-05', 1, 0, NULL),
(1, '2025-11-06', 1, 0, NULL),
(1, '2025-11-07', 1, 0, NULL),
(1, '2025-11-08', 1, 0, NULL);

-- Empleado 2: María González (1 falta justificada)
INSERT INTO asistencia (id_empleado, fecha, presente, es_justificada, justificacion) VALUES
(2, '2025-11-01', 1, 0, NULL),
(2, '2025-11-04', 0, 1, 'Consulta médica programada'),
(2, '2025-11-05', 1, 0, NULL),
(2, '2025-11-06', 1, 0, NULL),
(2, '2025-11-07', 1, 0, NULL);

-- ==========================================
-- 13. CABINAS, PISTOLAS Y HORNOS
-- ==========================================

-- Pistolas (máquinas de pintura)
INSERT INTO pistola (nombre, descripcion, horas_uso, horas_mantenimiento, ultimo_mantenimiento, estado) VALUES
('Pistola Automática A1', 'Pistola automática de alta precisión', 250.50, 500, '2025-10-01', 'activa'),
('Pistola Automática A2', 'Pistola automática secundaria', 180.25, 500, '2025-10-15', 'activa'),
('Pistola Manual B1', 'Pistola manual para detalles finos', 420.00, 500, '2025-08-20', 'activa'),
('Pistola Manual B2', 'Pistola manual de respaldo', 85.00, 500, '2025-11-01', 'activa'),
('Pistola Precision C1', 'Pistola de precisión para piezas pequeñas', 350.75, 500, '2025-09-10', 'activa'),
('Pistola Industrial D1', 'Pistola industrial de alto volumen', 480.00, 500, '2025-07-15', 'mantenimiento');

-- Hornos (secado y curado)
INSERT INTO horno (nombre, descripcion, horas_uso, horas_mantenimiento, temperatura_max, gasto_gas_hora, ultimo_mantenimiento, estado) VALUES
('Horno Principal 1', 'Horno principal de secado rápido', 720.50, 1000, 220.00, 2.5, '2025-09-15', 'activo'),
('Horno Principal 2', 'Horno principal de respaldo', 580.25, 1000, 220.00, 2.5, '2025-10-01', 'activo'),
('Horno Curado Grande', 'Horno de curado para piezas grandes', 850.00, 1000, 250.00, 3.0, '2025-08-01', 'activo'),
('Horno Pequeño A', 'Horno pequeño para componentes', 320.00, 1000, 180.00, 1.5, '2025-11-01', 'activo');

-- Cabinas de pintura
INSERT INTO cabina (nombre, descripcion, max_piezas_diarias, piezas_hoy, estado) VALUES
('Cabina Principal A', 'Cabina de pintura automática principal', 200, 0, 'activa'),
('Cabina Secundaria B', 'Cabina de pintura secundaria', 150, 0, 'activa'),
('Cabina Especial C', 'Cabina para piezas especiales y grandes', 100, 0, 'activa'),
('Cabina Manual D', 'Cabina de pintura manual para detalles', 80, 0, 'activa');

-- Asignación Cabina-Pistola (muchos a muchos)
INSERT INTO cabinapistola (id_cabina, id_pistola, fecha_asignacion, activa) VALUES
(1, 1, '2025-01-01', TRUE),  -- Cabina A: Pistola A1
(1, 2, '2025-01-01', TRUE),  -- Cabina A: Pistola A2 (dos pistolas)
(2, 3, '2025-01-01', TRUE),  -- Cabina B: Pistola B1
(2, 4, '2025-03-01', TRUE),  -- Cabina B: Pistola B2 (dos pistolas)
(3, 5, '2025-01-01', TRUE),  -- Cabina C: Pistola C1
(4, 3, '2025-06-01', FALSE); -- Cabina D: Pistola B1 (inactiva - movida a cabina B)

-- Asignación Cabina-Horno (muchos a muchos)
INSERT INTO cabinahorno (id_cabina, id_horno, fecha_asignacion, activo) VALUES
(1, 1, '2025-01-01', TRUE),  -- Cabina A: Horno Principal 1
(1, 2, '2025-01-01', TRUE),  -- Cabina A: Horno Principal 2 (dos hornos)
(2, 2, '2025-01-01', TRUE),  -- Cabina B: Horno Principal 2 (compartido)
(3, 3, '2025-01-01', TRUE),  -- Cabina C: Horno Grande
(4, 4, '2025-01-01', TRUE);  -- Cabina D: Horno Pequeño

-- ==========================================
-- 14. HISTORIAL DE CABINAS
-- ==========================================
INSERT INTO cabinahistorial (id_cabina, fecha, piezas_pintadas, id_pieza, id_pintura, horas_trabajo, gas_consumido) VALUES
(1, '2025-11-05', 50, 1, 1, 5.0, 12.5),
(1, '2025-11-06', 80, 2, 3, 8.0, 20.0),
(2, '2025-11-08', 70, 5, 4, 7.0, 17.5),
(3, '2025-11-10', 50, 8, 6, 5.0, 15.0),
(1, '2025-11-13', 120, 11, 1, 12.0, 30.0);

-- ==========================================
-- VERIFICACIÓN FINAL
-- ==========================================

SELECT 'RESUMEN DE DATOS INSERTADOS' AS '';
SELECT '=========================' AS '';

SELECT CONCAT('Clientes: ', COUNT(*)) AS resumen FROM cliente;
SELECT CONCAT('Proveedores: ', COUNT(*)) AS resumen FROM proveedor;
SELECT CONCAT('Marcas: ', COUNT(*)) AS resumen FROM marca;
SELECT CONCAT('Colores: ', COUNT(*)) AS resumen FROM color;
SELECT CONCAT('Tipos de Pintura: ', COUNT(*)) AS resumen FROM tipopintura;
SELECT CONCAT('Pinturas: ', COUNT(*)) AS resumen FROM pintura;
SELECT CONCAT('Piezas: ', COUNT(*)) AS resumen FROM pieza;
SELECT CONCAT('Remitos: ', COUNT(*)) AS resumen FROM remito;
SELECT CONCAT('Detalles de Remito: ', COUNT(*)) AS resumen FROM remitodetalle;
SELECT CONCAT('Stock de Piezas: ', COUNT(*)) AS resumen FROM stockpieza;
SELECT CONCAT('Piezas Pintadas: ', COUNT(*)) AS resumen FROM piezapintada;
SELECT CONCAT('Facturas: ', COUNT(*)) AS resumen FROM factura;
SELECT CONCAT('Detalles de Factura: ', COUNT(*)) AS resumen FROM facturadetalle;
SELECT CONCAT('Empleados: ', COUNT(*)) AS resumen FROM empleado;
SELECT CONCAT('Cabinas: ', COUNT(*)) AS resumen FROM cabina;
SELECT CONCAT('Pistolas: ', COUNT(*)) AS resumen FROM pistola;
SELECT CONCAT('Hornos: ', COUNT(*)) AS resumen FROM horno;

SELECT '' AS '';
SELECT 'ESTADO DE STOCK DE PIEZAS' AS '';
SELECT '========================' AS '';
SELECT 
    p.id_pieza,
    c.nombre AS cliente,
    p.detalle,
    sp.total_recibida,
    sp.total_pintada,
    sp.stock_disponible
FROM stockpieza sp
JOIN pieza p ON p.id_pieza = sp.id_pieza
JOIN cliente c ON c.id_cliente = p.id_cliente
ORDER BY p.id_pieza;

SELECT '' AS '';
SELECT 'ESTADO DE PINTURAS' AS '';
SELECT '==================' AS '';
SELECT 
    id_pintura,
    m.nombre AS marca,
    co.nombre AS color,
    t.nombre AS tipo,
    cantidad_kg AS stock_kg
FROM pintura pi
JOIN marca m ON m.id_marca = pi.id_marca
JOIN color co ON co.id_color = pi.id_color
JOIN tipopintura t ON t.id_tipo = pi.id_tipo
ORDER BY id_pintura;

-- ==========================================
-- REACTIVAR VALIDACIONES
-- ==========================================
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================
