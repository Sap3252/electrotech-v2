-- ==========================================
-- ELECTROTECH - CORE 3: MAQUINARIA UPDATE
-- ==========================================
-- Script para actualizar la BD con soporte de maquinaria en piezas pintadas
-- Date: 2025-12-03
-- ==========================================

USE electrotech2;

-- ==========================================
-- 1. AGREGAR CAMPO id_maquinaria A piezapintada
-- ==========================================
ALTER TABLE `piezapintada` 
ADD COLUMN `id_maquinaria` INT NULL AFTER `id_pintura`,
ADD KEY `id_maquinaria` (`id_maquinaria`),
ADD CONSTRAINT `piezapintada_ibfk_3` 
  FOREIGN KEY (`id_maquinaria`) REFERENCES `maquinaria` (`id_maquinaria`);

-- ==========================================
-- 2. AGREGAR CAMPO nombre A maquinaria
-- ==========================================
ALTER TABLE `maquinaria`
ADD COLUMN `nombre` VARCHAR(100) NOT NULL AFTER `id_maquinaria`,
ADD COLUMN `estado` ENUM('activa', 'mantenimiento', 'inactiva') DEFAULT 'activa' AFTER `max_piezas_diarias`,
ADD COLUMN `fecha_ultimo_mantenimiento` DATE NULL AFTER `estado`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `fecha_ultimo_mantenimiento`;

-- ==========================================
-- 3. AGREGAR CAMPO tipo_alerta A alertasmaquinaria
-- ==========================================
ALTER TABLE `alertasmaquinaria`
ADD COLUMN `tipo_alerta` ENUM('limite_diario', 'mantenimiento', 'falla', 'advertencia') DEFAULT 'advertencia' AFTER `mensaje`,
ADD COLUMN `leida` TINYINT(1) DEFAULT 0 AFTER `tipo_alerta`;

-- ==========================================
-- 4. TRIGGER PARA ACTUALIZAR maquinariahistorial
-- ==========================================
DELIMITER $$
CREATE TRIGGER `trg_piezapintada_ai_maquinaria` 
AFTER INSERT ON `piezapintada` 
FOR EACH ROW 
BEGIN
  -- Registrar en el historial de la maquinaria
  IF NEW.id_maquinaria IS NOT NULL THEN
    INSERT INTO maquinariahistorial (id_maquinaria, fecha, piezas_pintadas, id_pieza, id_pintura)
    VALUES (NEW.id_maquinaria, CURDATE(), NEW.cantidad, NEW.id_pieza, NEW.id_pintura);
    
    -- Actualizar horas de uso (asumimos 0.1 horas por pieza pintada)
    UPDATE maquinaria 
    SET horas_uso = horas_uso + (NEW.cantidad * 0.1)
    WHERE id_maquinaria = NEW.id_maquinaria;
  END IF;
END$$
DELIMITER ;

-- ==========================================
-- 5. INSERTAR DATOS DE EJEMPLO DE MAQUINARIAS
-- ==========================================
INSERT INTO `maquinaria` (`nombre`, `descripcion`, `horas_uso`, `max_piezas_diarias`, `estado`) VALUES
('Cabina de Pintura A1', 'Cabina principal para piezas grandes', 0, 100, 'activa'),
('Cabina de Pintura B2', 'Cabina secundaria para piezas medianas', 0, 80, 'activa'),
('Pistola Automática C3', 'Sistema automático de pintado', 0, 150, 'activa'),
('Cabina Manual D4', 'Cabina para trabajos especiales', 0, 50, 'activa');

-- ==========================================
-- 6. VISTA: Uso diario por maquinaria
-- ==========================================
CREATE OR REPLACE VIEW `v_uso_diario_maquinaria` AS
SELECT 
  m.id_maquinaria,
  m.nombre,
  m.max_piezas_diarias,
  m.estado,
  COALESCE(SUM(CASE WHEN mh.fecha = CURDATE() THEN mh.piezas_pintadas ELSE 0 END), 0) AS piezas_hoy,
  m.max_piezas_diarias - COALESCE(SUM(CASE WHEN mh.fecha = CURDATE() THEN mh.piezas_pintadas ELSE 0 END), 0) AS piezas_restantes,
  ROUND((COALESCE(SUM(CASE WHEN mh.fecha = CURDATE() THEN mh.piezas_pintadas ELSE 0 END), 0) / m.max_piezas_diarias) * 100, 2) AS porcentaje_uso
FROM maquinaria m
LEFT JOIN maquinariahistorial mh ON mh.id_maquinaria = m.id_maquinaria
GROUP BY m.id_maquinaria, m.nombre, m.max_piezas_diarias, m.estado;

-- ==========================================
-- 7. VISTA: Pinturas más usadas por maquinaria
-- ==========================================
CREATE OR REPLACE VIEW `v_pinturas_mas_usadas_maquinaria` AS
SELECT 
  m.id_maquinaria,
  m.nombre AS maquinaria,
  p.id_pintura,
  CONCAT(ma.nombre, ' - ', c.nombre, ' - ', t.nombre) AS pintura,
  SUM(mh.piezas_pintadas) AS total_piezas,
  COUNT(*) AS veces_usada
FROM maquinaria m
JOIN maquinariahistorial mh ON mh.id_maquinaria = m.id_maquinaria
JOIN pintura p ON p.id_pintura = mh.id_pintura
JOIN marca ma ON ma.id_marca = p.id_marca
JOIN color c ON c.id_color = p.id_color
JOIN tipopintura t ON t.id_tipo = p.id_tipo
GROUP BY m.id_maquinaria, m.nombre, p.id_pintura, ma.nombre, c.nombre, t.nombre
ORDER BY m.id_maquinaria, total_piezas DESC;

-- ==========================================
-- 8. VISTA: Resumen mensual por maquinaria
-- ==========================================
CREATE OR REPLACE VIEW `v_resumen_mensual_maquinaria` AS
SELECT 
  m.id_maquinaria,
  m.nombre AS maquinaria,
  YEAR(mh.fecha) AS anio,
  MONTH(mh.fecha) AS mes,
  SUM(mh.piezas_pintadas) AS total_piezas,
  COUNT(DISTINCT mh.fecha) AS dias_trabajados,
  ROUND(AVG(mh.piezas_pintadas), 2) AS promedio_diario
FROM maquinaria m
JOIN maquinariahistorial mh ON mh.id_maquinaria = m.id_maquinaria
GROUP BY m.id_maquinaria, m.nombre, YEAR(mh.fecha), MONTH(mh.fecha)
ORDER BY anio DESC, mes DESC, total_piezas DESC;

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================
