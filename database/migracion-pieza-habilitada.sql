-- Migración: Agregar columna habilitada a la tabla Pieza
-- Fecha: 2025-12-11
-- Descripción: Permite deshabilitar piezas sin eliminarlas

-- Agregar columna habilitada (por defecto 1 = habilitada)
ALTER TABLE Pieza 
ADD COLUMN habilitada TINYINT(1) NOT NULL DEFAULT 1
AFTER detalle;

-- Actualizar todas las piezas existentes como habilitadas
UPDATE Pieza SET habilitada = 1;
