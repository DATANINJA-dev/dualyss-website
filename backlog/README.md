# Dualys Backlog

Sistema de gestión de tareas para el desarrollo del proyecto Dualys.

## Estructura

```
backlog/
├── tasks.json       # Índice de todas las tareas
├── tasks/           # Archivos individuales de tareas
│   ├── TASK-001.md
│   ├── TASK-002.md
│   └── ...
├── archive/         # Tareas completadas archivadas
└── README.md        # Este archivo
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/suggest-task` | Recomienda la siguiente tarea a trabajar |
| `/update-task TASK-XXX status` | Actualiza el estado de una tarea |
| `/archive-tasks` | Archiva tareas completadas |

## Estados de Tareas

- `backlog` - En espera, lista para ser trabajada
- `in_progress` - Actualmente en desarrollo
- `done` - Completada
- `deferred` - Pospuesta indefinidamente

## Prioridades

- `P0` - Crítica, bloquea otras tareas
- `P1` - Alta, importante para el MVP
- `P2` - Media, mejoras
- `P3` - Baja, nice-to-have

## Tipos de Tareas

- `feature` - Nueva funcionalidad
- `infrastructure` - Configuración/setup
- `design` - Cambios de diseño
- `testing` - Tests y QA
- `security` - Seguridad
- `refactor` - Mejora de código
- `cleanup` - Limpieza

## Flujo de Trabajo

1. Consultar `/suggest-task` para ver qué trabajar
2. Ejecutar `/update-task TASK-XXX in_progress`
3. Desarrollar la tarea
4. Ejecutar `/update-task TASK-XXX done`
5. Periódicamente, ejecutar `/archive-tasks`

## Tareas Actuales

Ver `tasks.json` para el listado completo.
