-- =====================================================
-- DATOS DE PRUEBA PARA MÓDULO EMPLEADOS
-- Uso: mysql -u user -p electrotech2 < database/data-empleados.sql
-- =====================================================

USE electrotech2;

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. ACTUALIZAR EMPLEADOS EXISTENTES CON DATOS COMPLETOS
-- =====================================================
UPDATE empleado SET
  telefono = '11-2345-6789',
  dni = '30123456',
  direccion = 'Av. Corrientes 1234, CABA',
  salario_base = 450000.00,
  fecha_ingreso = '2020-03-15',
  activo = 1
WHERE id_empleado = 1;

UPDATE empleado SET
  telefono = '11-3456-7890',
  dni = '28765432',
  direccion = 'Calle Rivadavia 567, CABA',
  salario_base = 580000.00,
  fecha_ingreso = '2018-06-01',
  activo = 0
WHERE id_empleado = 2;

UPDATE empleado SET
  telefono = '11-4567-8901',
  dni = '32456789',
  direccion = 'San Martín 890, Avellaneda',
  salario_base = 520000.00,
  fecha_ingreso = '2021-01-10',
  activo = 1
WHERE id_empleado = 3;

UPDATE empleado SET
  telefono = '11-5678-9012',
  dni = '33789012',
  direccion = 'Belgrano 456, Lanús',
  salario_base = 430000.00,
  fecha_ingreso = '2022-04-20',
  activo = 1
WHERE id_empleado = 4;

UPDATE empleado SET
  telefono = '11-6789-0123',
  dni = '27345678',
  direccion = 'Mitre 789, Quilmes',
  salario_base = 720000.00,
  fecha_ingreso = '2015-08-12',
  activo = 1
WHERE id_empleado = 5;

-- =====================================================
-- 2. ASISTENCIA - NOVIEMBRE 2025 (días laborales: lun-vie)
-- Empleado 1: Juan Pérez - 100% asistencia
-- Empleado 2: María González - inactiva (sin asistencia)
-- Empleado 3: Carlos Rodríguez - 2 faltas injustificadas
-- Empleado 4: Ana Martínez - 1 falta justificada
-- Empleado 5: Luis Fernández - 100% asistencia + horas extra
-- =====================================================

-- Limpiar asistencias previas del período
DELETE FROM asistencia WHERE fecha BETWEEN '2025-11-01' AND '2025-11-30';

-- EMPLEADO 1: Juan Pérez - Asistencia perfecta noviembre
INSERT INTO asistencia (id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo) VALUES
(1, '2025-11-03', 1, 0, 0, NULL, NULL),
(1, '2025-11-04', 1, 0, 0, NULL, NULL),
(1, '2025-11-05', 1, 0, 0, NULL, NULL),
(1, '2025-11-06', 1, 0, 0, NULL, NULL),
(1, '2025-11-07', 1, 0, 0, NULL, NULL),
(1, '2025-11-10', 1, 0, 0, NULL, NULL),
(1, '2025-11-11', 1, 0, 0, NULL, NULL),
(1, '2025-11-12', 1, 0, 0, NULL, NULL),
(1, '2025-11-13', 1, 0, 0, NULL, NULL),
(1, '2025-11-14', 1, 0, 0, NULL, NULL),
(1, '2025-11-17', 1, 0, 0, NULL, NULL),
(1, '2025-11-18', 1, 0, 0, NULL, NULL),
(1, '2025-11-19', 1, 0, 0, NULL, NULL),
(1, '2025-11-20', 1, 0, 0, NULL, NULL),
(1, '2025-11-21', 1, 0, 0, NULL, NULL),
(1, '2025-11-24', 1, 0, 0, NULL, NULL),
(1, '2025-11-25', 1, 0, 0, NULL, NULL),
(1, '2025-11-26', 1, 0, 0, NULL, NULL),
(1, '2025-11-27', 1, 0, 0, NULL, NULL),
(1, '2025-11-28', 1, 0, 0, NULL, NULL);

-- EMPLEADO 3: Carlos Rodríguez - 2 faltas injustificadas
INSERT INTO asistencia (id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo) VALUES
(3, '2025-11-03', 1, 0, 0, NULL, NULL),
(3, '2025-11-04', 1, 0, 0, NULL, NULL),
(3, '2025-11-05', 0, 0, 0, 0, NULL),  -- Falta injustificada
(3, '2025-11-06', 1, 0, 0, NULL, NULL),
(3, '2025-11-07', 1, 0, 0, NULL, NULL),
(3, '2025-11-10', 1, 0, 0, NULL, NULL),
(3, '2025-11-11', 1, 0, 0, NULL, NULL),
(3, '2025-11-12', 1, 0, 0, NULL, NULL),
(3, '2025-11-13', 0, 0, 0, 0, NULL),  -- Falta injustificada
(3, '2025-11-14', 1, 0, 0, NULL, NULL),
(3, '2025-11-17', 1, 0, 0, NULL, NULL),
(3, '2025-11-18', 1, 0, 0, NULL, NULL),
(3, '2025-11-19', 1, 0, 0, NULL, NULL),
(3, '2025-11-20', 1, 0, 0, NULL, NULL),
(3, '2025-11-21', 1, 0, 0, NULL, NULL),
(3, '2025-11-24', 1, 0, 0, NULL, NULL),
(3, '2025-11-25', 1, 0, 0, NULL, NULL),
(3, '2025-11-26', 1, 0, 0, NULL, NULL),
(3, '2025-11-27', 1, 0, 0, NULL, NULL),
(3, '2025-11-28', 1, 0, 0, NULL, NULL);

-- EMPLEADO 4: Ana Martínez - 1 falta justificada (turno médico)
INSERT INTO asistencia (id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo) VALUES
(4, '2025-11-03', 1, 0, 0, NULL, NULL),
(4, '2025-11-04', 1, 0, 0, NULL, NULL),
(4, '2025-11-05', 1, 0, 0, NULL, NULL),
(4, '2025-11-06', 1, 0, 0, NULL, NULL),
(4, '2025-11-07', 1, 0, 0, NULL, NULL),
(4, '2025-11-10', 0, 0, 0, 1, 'Turno médico programado'),  -- Falta justificada
(4, '2025-11-11', 1, 0, 0, NULL, NULL),
(4, '2025-11-12', 1, 0, 0, NULL, NULL),
(4, '2025-11-13', 1, 0, 0, NULL, NULL),
(4, '2025-11-14', 1, 0, 0, NULL, NULL),
(4, '2025-11-17', 1, 0, 0, NULL, NULL),
(4, '2025-11-18', 1, 0, 0, NULL, NULL),
(4, '2025-11-19', 1, 0, 0, NULL, NULL),
(4, '2025-11-20', 1, 0, 0, NULL, NULL),
(4, '2025-11-21', 1, 0, 0, NULL, NULL),
(4, '2025-11-24', 1, 0, 0, NULL, NULL),
(4, '2025-11-25', 1, 0, 0, NULL, NULL),
(4, '2025-11-26', 1, 0, 0, NULL, NULL),
(4, '2025-11-27', 1, 0, 0, NULL, NULL),
(4, '2025-11-28', 1, 0, 0, NULL, NULL);

-- EMPLEADO 5: Luis Fernández - Asistencia perfecta + horas extra + sábados
INSERT INTO asistencia (id_empleado, fecha, presente, es_sabado, horas_extra, justificada, motivo) VALUES
(5, '2025-11-03', 1, 0, 2, NULL, NULL),
(5, '2025-11-04', 1, 0, 0, NULL, NULL),
(5, '2025-11-05', 1, 0, 3, NULL, NULL),
(5, '2025-11-06', 1, 0, 0, NULL, NULL),
(5, '2025-11-07', 1, 0, 2, NULL, NULL),
(5, '2025-11-08', 1, 1, 4, NULL, NULL),  -- Sábado
(5, '2025-11-10', 1, 0, 0, NULL, NULL),
(5, '2025-11-11', 1, 0, 2, NULL, NULL),
(5, '2025-11-12', 1, 0, 0, NULL, NULL),
(5, '2025-11-13', 1, 0, 0, NULL, NULL),
(5, '2025-11-14', 1, 0, 1, NULL, NULL),
(5, '2025-11-15', 1, 1, 5, NULL, NULL),  -- Sábado
(5, '2025-11-17', 1, 0, 0, NULL, NULL),
(5, '2025-11-18', 1, 0, 2, NULL, NULL),
(5, '2025-11-19', 1, 0, 0, NULL, NULL),
(5, '2025-11-20', 1, 0, 0, NULL, NULL),
(5, '2025-11-21', 1, 0, 1, NULL, NULL),
(5, '2025-11-24', 1, 0, 0, NULL, NULL),
(5, '2025-11-25', 1, 0, 0, NULL, NULL),
(5, '2025-11-26', 1, 0, 2, NULL, NULL),
(5, '2025-11-27', 1, 0, 0, NULL, NULL),
(5, '2025-11-28', 1, 0, 0, NULL, NULL);

-- =====================================================
-- 3. RECIBOS DE SUELDO - OCTUBRE Y NOVIEMBRE 2025
-- =====================================================

-- Limpiar recibos previos
DELETE FROM recibo_sueldo WHERE periodo_anio = 2025 AND periodo_mes IN (10, 11);

-- OCTUBRE 2025 - Primera Quincena
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (1, 1, 10, 2025, '2025-10-01', '2025-10-15', 225000.00, 20250.00, 0.00, 0.00, 0.00, 0.00, 245250.00, 0.00, 245250.00, 11, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (3, 1, 10, 2025, '2025-10-01', '2025-10-15', 260000.00, 0.00, 0.00, 0.00, 17333.33, 0.00, 260000.00, 17333.33, 242666.67, 10, 0, 1, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (4, 1, 10, 2025, '2025-10-01', '2025-10-15', 215000.00, 19350.00, 0.00, 0.00, 0.00, 0.00, 234350.00, 0.00, 234350.00, 11, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (5, 1, 10, 2025, '2025-10-01', '2025-10-15', 360000.00, 32400.00, 13500.00, 0.00, 0.00, 0.00, 405900.00, 0.00, 405900.00, 11, 0, 0, 6);

-- OCTUBRE 2025 - Segunda Quincena
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (1, 2, 10, 2025, '2025-10-16', '2025-10-31', 225000.00, 20250.00, 0.00, 0.00, 0.00, 0.00, 245250.00, 0.00, 245250.00, 12, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (3, 2, 10, 2025, '2025-10-16', '2025-10-31', 260000.00, 23400.00, 0.00, 0.00, 0.00, 0.00, 283400.00, 0.00, 283400.00, 12, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (4, 2, 10, 2025, '2025-10-16', '2025-10-31', 215000.00, 19350.00, 0.00, 0.00, 0.00, 0.00, 234350.00, 0.00, 234350.00, 12, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (5, 2, 10, 2025, '2025-10-16', '2025-10-31', 360000.00, 32400.00, 27000.00, 0.00, 0.00, 0.00, 419400.00, 0.00, 419400.00, 12, 0, 0, 8);

-- NOVIEMBRE 2025 - Primera Quincena (1-15)
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (1, 1, 11, 2025, '2025-11-01', '2025-11-15', 225000.00, 20250.00, 0.00, 0.00, 0.00, 0.00, 245250.00, 0.00, 245250.00, 10, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (3, 1, 11, 2025, '2025-11-01', '2025-11-15', 260000.00, 0.00, 0.00, 0.00, 34666.66, 0.00, 260000.00, 34666.66, 225333.34, 8, 0, 2, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (4, 1, 11, 2025, '2025-11-01', '2025-11-15', 215000.00, 19350.00, 0.00, 0.00, 0.00, 0.00, 234350.00, 0.00, 234350.00, 9, 1, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (5, 1, 11, 2025, '2025-11-01', '2025-11-15', 360000.00, 32400.00, 67500.00, 0.00, 0.00, 0.00, 459900.00, 0.00, 459900.00, 12, 0, 0, 15);

-- NOVIEMBRE 2025 - Segunda Quincena (16-30)
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (1, 2, 11, 2025, '2025-11-16', '2025-11-30', 225000.00, 20250.00, 0.00, 0.00, 0.00, 0.00, 245250.00, 0.00, 245250.00, 10, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (3, 2, 11, 2025, '2025-11-16', '2025-11-30', 260000.00, 23400.00, 0.00, 0.00, 0.00, 0.00, 283400.00, 0.00, 283400.00, 10, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (4, 2, 11, 2025, '2025-11-16', '2025-11-30', 215000.00, 19350.00, 0.00, 0.00, 0.00, 0.00, 234350.00, 0.00, 234350.00, 10, 0, 0, 0);
INSERT INTO recibo_sueldo (id_empleado, periodo_quincena, periodo_mes, periodo_anio, fecha_desde, fecha_hasta, salario_base, presentismo, horas_extra_monto, bonificaciones, descuento_ausencias, otros_descuentos, total_haberes, total_descuentos, total_neto, dias_trabajados, dias_ausentes_justificados, dias_ausentes_injustificados, total_horas_extra) VALUES (5, 2, 11, 2025, '2025-11-16', '2025-11-30', 360000.00, 32400.00, 11250.00, 0.00, 0.00, 0.00, 403650.00, 0.00, 403650.00, 10, 0, 0, 5);

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

-- =====================================================
-- Verificación
-- =====================================================
SELECT '=== EMPLEADOS ===' AS info;
SELECT id_empleado, nombre, apellido, funcion, salario_base, activo FROM empleado;

SELECT '=== ASISTENCIA NOVIEMBRE 2025 ===' AS info;
SELECT id_empleado, COUNT(*) as dias, SUM(presente) as presentes, SUM(horas_extra) as horas_extra
FROM asistencia 
WHERE fecha BETWEEN '2025-11-01' AND '2025-11-30'
GROUP BY id_empleado;

SELECT '=== RECIBOS 2025 ===' AS info;
SELECT id_empleado, periodo_mes, periodo_quincena, total_neto
FROM recibo_sueldo
WHERE periodo_anio = 2025
ORDER BY id_empleado, periodo_mes, periodo_quincena;
