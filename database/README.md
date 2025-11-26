# Sistema RBAC - Electrotech

## 📁 Archivo Principal

**`rbac-completo.sql`** - Script unificado que contiene:
- ✅ Estructura completa de tablas (Modulo, Formulario, Componente, GrupoComponente)
- ✅ 4 Módulos del sistema
- ✅ 15 Formularios
- ✅ 24 Componentes (IDs 1-23, 27)
- ✅ Permisos completos para grupo Admin
- ✅ Vistas útiles (v_estructura_permisos, v_permisos_grupo)
- ✅ Queries de verificación

## 🚀 Cómo usar

### Instalación inicial
```bash
mysql -u usuario -p base_de_datos < database/rbac-completo.sql
```

O desde DBeaver:
1. Abrir `rbac-completo.sql`
2. Ejecutar script completo (Ctrl+Enter)
3. Verificar resultados en la query de verificación al final

## 📊 Estructura

### Módulos (4)
1. **Piezas y Pinturas** - Gestión de producción
2. **Facturación** - Facturas, remitos, clientes
3. **Reportes** - Estadísticas y análisis
4. **Administración** - Usuarios y grupos

### Componentes por Tipo
- **formulario** (7): Formularios de creación/edición
- **tabla** (5): Tablas de listado
- **boton** (6): Botones de acción (editar, eliminar, ver detalle, imprimir)
- **acceso** (6): Permisos de acceso a reportes

### Componentes Clave
- **1-4**: Piezas (formulario, tabla, editar, eliminar)
- **5-7**: Pinturas (formulario, tabla, eliminar)
- **8-9, 23**: Piezas Pintadas (formulario, tabla, eliminar)
- **10-13**: Remitos (formulario, tabla, ver, imprimir)
- **14-17**: Facturación (formulario, tabla, ver, imprimir)
- **18-22, 27**: Reportes (6 reportes con acceso)

## 🔧 Gestión de Permisos

### Desde la UI
1. Ir a `/dashboard/admin`
2. Click en "Gestión de Grupos"
3. Seleccionar un grupo
4. Marcar/desmarcar componentes
5. Guardar cambios

### Desde SQL
```sql
-- Ver permisos de un grupo
SELECT * FROM v_permisos_grupo WHERE id_grupo = 2;

-- Agregar permiso
INSERT INTO GrupoComponente (id_grupo, id_componente) VALUES (2, 15);

-- Quitar permiso
DELETE FROM GrupoComponente WHERE id_grupo = 2 AND id_componente = 4;

-- Copiar permisos de un grupo a otro
INSERT INTO GrupoComponente (id_grupo, id_componente)
SELECT 3, id_componente FROM GrupoComponente WHERE id_grupo = 2;
```

## 📝 Notas Importantes

- **Admin (id_grupo=1)** tiene TODOS los componentes automáticamente
- Los cambios de permisos requieren que los usuarios cierren sesión y vuelvan a entrar
- El sistema usa validación dinámica via `hasPermission(session, componenteId)`
- No hay arrays estáticos de permisos en el código (CORE_ACCESS eliminado)

## ⚠️ Migración desde versión anterior

Si ya tienes el sistema RBAC instalado:
1. El script usa `ON DUPLICATE KEY UPDATE` e `INSERT IGNORE`
2. Es seguro re-ejecutarlo, no duplicará datos
3. Solo agregará componentes faltantes (23, 27)
4. Actualizará permisos de Admin automáticamente

## 🔍 Queries Útiles

```sql
-- Componentes sin asignar a ningún grupo
SELECT c.* FROM Componente c
LEFT JOIN GrupoComponente gc ON gc.id_componente = c.id_componente
WHERE gc.id_componente IS NULL;

-- Grupos con más permisos
SELECT g.nombre, COUNT(gc.id_componente) as total_permisos
FROM Grupo g
JOIN GrupoComponente gc ON gc.id_grupo = g.id_grupo
GROUP BY g.id_grupo, g.nombre
ORDER BY total_permisos DESC;

-- Componentes de un formulario específico
SELECT * FROM v_estructura_permisos WHERE formulario = 'Facturación';
```

## 📚 Documentación Relacionada

- Código de validación: `src/lib/auth.ts` → `hasPermission()`
- Componentes protegidos: `src/components/ProtectedComponent.tsx`
- Páginas protegidas: `src/components/ProtectedPage.tsx`
- API endpoints: Todos validados con `hasPermission(session, componenteId)`
