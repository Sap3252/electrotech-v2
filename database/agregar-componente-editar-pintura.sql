-- ==========================================
-- Agregar Componente: Botón Editar Pintura
-- ==========================================
-- Este componente faltaba en el sistema RBAC

-- Agregar el componente
INSERT INTO Componente (id_componente, id_formulario, nombre, tipo) VALUES
(24, 2, 'Botón Editar Pintura', 'boton')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Asignarlo al grupo Admin (id_grupo=1)
INSERT IGNORE INTO GrupoComponente (id_grupo, id_componente) VALUES (1, 24);

-- Verificar
SELECT 
    c.id_componente,
    c.nombre AS componente,
    f.nombre AS formulario,
    CASE WHEN gc.id_grupo = 1 THEN '✅' ELSE '❌' END AS Admin_tiene_acceso
FROM Componente c
JOIN Formulario f ON f.id_formulario = c.id_formulario
LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente AND gc.id_grupo = 1
WHERE f.id_formulario = 2
ORDER BY c.id_componente;
