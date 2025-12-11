-- Migración: Agregar columna habilitada a la tabla Pintura
-- Fecha: 2025-12-11
-- Descripción: Permite deshabilitar pinturas sin eliminarlas

-- Agregar columna habilitada (por defecto 1 = habilitada)
ALTER TABLE Pintura 
ADD COLUMN habilitada TINYINT(1) NOT NULL DEFAULT 1
AFTER precio_unitario;

-- Actualizar todas las pinturas existentes como habilitadas
UPDATE Pintura SET habilitada = 1;
