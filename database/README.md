# Base de Datos Electrotech2

## ⚠️ IMPORTANTE: La base de datos se llama `electrotech2`

## 📁 Archivos SQL

| Archivo | Descripción | Orden de ejecución |
|---------|-------------|-------------------|
| `electrotech-schema.sql` | Estructura completa de tablas | 1° |
| `rbac-completo.sql` | Sistema RBAC (módulos, formularios, componentes) | 2° |
| `rbac-maquinarias.sql` | RBAC para Core 3 - Maquinarias | 3° |
| `maquinaria-update.sql` | Actualización para soporte de maquinarias | 4° |
| `reset-data.sql` | Resetear y repoblar datos de prueba | Opcional |

## 🚀 Instalación Completa

### Opción 1: Desde la terminal
```bash
# 1. Crear la base de datos y estructura
mysql -u root -p < database/electrotech-schema.sql

# 2. Instalar sistema RBAC
mysql -u root -p electrotech2 < database/rbac-completo.sql

# 3. Agregar RBAC para maquinarias
mysql -u root -p electrotech2 < database/rbac-maquinarias.sql

# 4. Actualizar para soporte de maquinarias
mysql -u root -p electrotech2 < database/maquinaria-update.sql

# 5. (Opcional) Cargar datos de prueba
mysql -u root -p electrotech2 < database/reset-data.sql
```

### Opción 2: Desde DBeaver o MySQL Workbench
1. Ejecutar cada archivo en el orden indicado
2. Asegurarse de estar conectado a `electrotech2`

## 📊 Estructura RBAC

### Módulos (5)
1. **Piezas y Pinturas** - Gestión de producción
2. **Facturación** - Facturas, remitos, clientes
3. **Reportes** - Estadísticas y análisis
4. **Administración** - Usuarios y grupos
5. **Maquinarias** - Gestión de maquinarias (Core 3)

### Formularios de Maquinarias
| ID | Ruta | Descripción |
|----|------|-------------|
| 16 | `/dashboard/maquinarias` | Gestión de maquinarias |
| 17 | `/reportes/maquinarias` | Reportes de maquinarias |

### Componentes de Maquinarias (IDs 30-42)
| ID | Componente | Tipo |
|----|------------|------|
| 30 | Formulario Nueva Maquinaria | formulario |
| 31 | Tabla Listado Maquinarias | tabla |
| 32 | Botón Ver Detalle | boton |
| 33 | Botón Editar | boton |
| 34 | Botón Eliminar | boton |
| 35 | Botón Registrar Mantenimiento | boton |
| 36 | Ver Alertas | seccion |
| 37 | Acceso Reportes Maquinarias | acceso |
| 38-41 | Secciones de reportes | seccion |
| 42 | Selector Maquinaria (en piezas pintadas) | formulario |

## 🔧 Variables de Entorno

Asegúrate de tener en `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=electrotech2
```

## 📝 Notas

- El grupo **Admin** (id_grupo=1) tiene todos los permisos automáticamente
- Los nuevos componentes usan IDs desde el 30 para evitar conflictos
- Las rutas protegidas se validan con `ProtectedPage` y `ProtectedComponent`
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
