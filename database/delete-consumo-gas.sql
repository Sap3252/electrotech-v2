-- Eliminar componente "Botón Registrar Consumo Gas"
USE electrotech2;

SET SQL_SAFE_UPDATES = 0;

-- Eliminar asignaciones
DELETE FROM GrupoComponente WHERE id_componente IN (
    SELECT id_componente FROM (
        SELECT id_componente FROM Componente WHERE nombre = 'Botón Registrar Consumo Gas'
    ) AS temp
);

-- Eliminar componente
DELETE FROM Componente WHERE nombre = 'Botón Registrar Consumo Gas';

SET SQL_SAFE_UPDATES = 1;

-- Verificar
SELECT 'Componente eliminado' AS resultado;
