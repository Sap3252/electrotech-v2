# Base de Datos Electrotech2

## ⚠️ IMPORTANTE: La base de datos se llama `electrotech2`

## 📁 Estructura de Archivos

| Archivo | Descripción | Orden |
|---------|-------------|-------|
| `electrotech-schema.sql` | Estructura completa de tablas (CREATE TABLE) | 1° |
| `rbac-unificado.sql` | Sistema RBAC completo (módulos 1-6) | 2° |
| `reset-data.sql` | Resetear y repoblar datos de prueba | 3° (opcional) |
| `data-empleados.sql` | Datos de prueba para empleados | 4° (opcional) |

## 🚀 Instalación Completa

### Desde terminal
```bash
# 1. Crear la base de datos y estructura
mysql -u root -p < database/electrotech-schema.sql

# 2. Instalar sistema RBAC completo
mysql -u root -p electrotech2 < database/rbac-unificado.sql

# 3. (Opcional) Cargar datos de prueba
mysql -u root -p electrotech2 < database/reset-data.sql

# 4. (Opcional) Cargar datos de empleados
mysql -u root -p electrotech2 < database/data-empleados.sql
```

## 📊 Estructura RBAC

### Módulos (6)

| ID | Módulo | Descripción |
|----|--------|-------------|
| 1 | Piezas y Pinturas | Gestión de producción |
| 2 | Facturación | Facturas, remitos, clientes |
| 3 | Reportes | Estadísticas y análisis |
| 4 | Administración | Usuarios y grupos |
| 5 | Empleados y Nómina | Gestión de empleados, asistencia, recibos |
| 6 | Maquinarias | Gestión de cabinas, pistolas, hornos |

### Formularios por Módulo

#### Módulo 1: Piezas y Pinturas
| ID | Ruta | Descripción |
|----|------|-------------|
| 1 | `/piezas` | Gestión de Piezas |
| 2 | `/pinturas` | Gestión de Pinturas |
| 3 | `/piezas-pintadas` | Piezas Pintadas |
| 4 | `/pinturas/calculadora` | Calculadora de Consumo |

#### Módulo 2: Facturación
| ID | Ruta | Descripción |
|----|------|-------------|
| 5 | `/remitos` | Remitos |
| 6 | `/facturacion` | Facturación |
| 7 | `/clientes` | Clientes |

#### Módulo 3: Reportes
| ID | Ruta | Descripción |
|----|------|-------------|
| 15 | `/reportes` | Reportes Principal (padre de todos) |

#### Módulo 4: Administración
| ID | Ruta | Descripción |
|----|------|-------------|
| 14 | `/dashboard/usuarios` | Usuarios |

#### Módulo 5: Empleados y Nómina
| ID | Ruta | Descripción |
|----|------|-------------|
| 16 | `/dashboard/empleados` | Gestión de Empleados |
| 17 | `/dashboard/empleados/[id]/asistencia` | Asistencia Empleado |
| 18 | `/dashboard/empleados/[id]/recibos` | Recibos Empleado |
| 19 | `/dashboard/recibos` | Gestión de Recibos |

#### Módulo 6: Maquinarias
| ID | Ruta | Descripción |
|----|------|-------------|
| 20 | `/dashboard/maquinarias` | Gestión de Maquinarias |
| 21 | `/reportes/maquinarias` | Reportes Maquinarias Principal |
| 22 | `/reportes/maquinarias/uso-cabinas` | Reporte Uso Cabinas |
| 23 | `/reportes/maquinarias/productividad-diaria` | Productividad Diaria |
| 24 | `/reportes/maquinarias/mantenimiento-pistolas` | Mantenimiento Pistolas |
| 25 | `/reportes/maquinarias/mantenimiento-hornos` | Mantenimiento Hornos |
| 26 | `/reportes/maquinarias/consumo-gas` | Consumo Gas |

### Rangos de IDs de Componentes

| Rango | Módulo |
|-------|--------|
| 1-9 | Piezas y Pinturas |
| 10-17 | Facturación |
| 18-29 | Reportes |
| 70-76 | Empleados - Gestión |
| 77-80 | Empleados - Asistencia |
| 81-85 | Empleados - Recibos Empleado |
| 86-89 | Empleados - Gestión Recibos |
| 90-107 | Maquinarias - Gestión |
| 108-113 | Maquinarias - Reportes |

## 🔧 Variables de Entorno

Asegúrate de tener en `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=electrotech2
```

## 📝 Gestión de Permisos

### Desde la UI
1. Ir a `/dashboard/admin`
2. Click en "Gestión de Grupos"
3. Seleccionar un grupo
4. Marcar/desmarcar componentes en el árbol jerárquico
5. Guardar cambios

### Desde SQL
```sql
-- Ver permisos de un grupo
SELECT * FROM v_permisos_grupo WHERE id_grupo = 2;

-- Agregar permiso
INSERT INTO GrupoComponente (id_grupo, id_componente) VALUES (2, 15);

-- Quitar permiso
DELETE FROM GrupoComponente WHERE id_grupo = 2 AND id_componente = 4;

-- Ver todos los permisos de Admin
SELECT * FROM v_permisos_grupo WHERE grupo = 'Admin';
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
