-- =====================================================
-- MIGRACIÓN: Cambiar columna fecha de DATE a DATETIME
-- Fecha: 2025-12-11
-- =====================================================

USE electrotech2;

-- Cambiar la columna fecha de DATE a DATETIME en PiezaPintada
ALTER TABLE PiezaPintada 
MODIFY COLUMN fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Verificar el cambio
DESCRIBE PiezaPintada;

-- =====================================================
-- NOTAS:
-- - Ahora la columna registrará fecha Y hora
-- - El valor por defecto es CURRENT_TIMESTAMP (fecha y hora actual)
-- - Los registros existentes mantendrán su fecha pero con hora 00:00:00
-- =====================================================
