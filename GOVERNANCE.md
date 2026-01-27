# 📋 Governance - Estándares de Desarrollo

## Definition of Ready (DoR)

Una historia de usuario está lista para ser trabajada en un sprint cuando cumple **TODOS** estos criterios:

### ✅ Criterios de DoR:

1. **Historia clara y completa**
   - Sigue el formato: "Como [rol], quiero [acción], para [valor]"
   - El título es descriptivo y específico
   - Tiene un ID único (ej: HU-001)

2. **Criterios de aceptación definidos**
   - Mínimo 5 criterios de aceptación técnicos y medibles
   - Incluye casos de borde identificados
   - Los criterios están en formato checklist

3. **Estimación completa**
   - Tiene label de estimación (size: 3, 5, 8, 13)
   - El equipo ha discutido y acordado la complejidad
   - La estimación es menor o igual a 13 puntos (si es mayor, debe dividirse)

4. **Prioridad asignada**
   - Tiene label de prioridad (P1, P2, P3)
   - P1: Crítico/Bloqueante
   - P2: Importante
   - P3: Deseable

5. **Detalles técnicos documentados**
   - Incluye notas técnicas sobre implementación
   - Especifica endpoints API si aplica
   - Define estructura de base de datos si aplica
   - Identifica dependencias con otras historias

6. **Responsable asignado**
   - Tiene al menos un desarrollador asignado
   - El desarrollador ha confirmado que entiende los requisitos

7. **Sin dependencias bloqueantes**
   - No depende de historias no completadas
   - Los recursos necesarios están disponibles
   - El entorno de desarrollo está listo

---

## Definition of Done (DoD)

Una historia de usuario se considera **COMPLETADA** cuando cumple **TODOS** estos criterios:

### ✅ Criterios de DoD:

1. **Código implementado**
   - El código cumple con todos los criterios de aceptación
   - Sigue las convenciones de código del proyecto (ESLint/Prettier configurado)
   - No contiene código comentado innecesario
   - Variables y funciones tienen nombres descriptivos

2. **Testing completo**
   - Tests unitarios implementados con mínimo 80% de cobertura
   - Tests de integración para endpoints API
   - Todos los tests pasan exitosamente (npm test)
   - Framework: Jest para backend, React Testing Library para frontend

3. **Code Review aprobado**
   - Pull Request creado y vinculado al issue
   - Al menos 1 revisor ha aprobado el PR
   - Todos los comentarios del code review están resueltos
   - No hay conflictos de merge

4. **Documentación actualizada**
   - README actualizado si aplica
   - Comentarios JSDoc en funciones complejas
   - API documentada en Swagger/Postman si aplica
   - Changelog actualizado con los cambios

5. **Control de calidad**
   - No hay errores de linting (npm run lint)
   - No hay warnings críticos en consola
   - Validaciones frontend y backend implementadas
   - Manejo de errores apropiado (try-catch, error boundaries)

6. **Seguridad verificada**
   - Inputs sanitizados contra XSS
   - SQL Injection prevenido (uso de ORMs o prepared statements)
   - Autenticación y autorización implementadas correctamente
   - Secrets no expuestos en código (uso de .env)

7. **Deployment exitoso**
   - Código mergeado a rama develop
   - Desplegado en ambiente de staging
   - Verificado funcionamiento en staging
   - Sin errores en logs de producción

8. **Aceptación del Product Owner**
   - El Product Owner ha revisado la funcionalidad
   - Todos los criterios de aceptación están verificados
   - No hay cambios adicionales solicitados

---

## 🛠️ Stack Tecnológico

**Backend:**
- Node.js + Express
- PostgreSQL con Prisma ORM
- JWT para autenticación
- Jest para testing

**Frontend:**
- React 18+ con Vite
- Tailwind CSS
- React Query para manejo de estado
- React Testing Library

**DevOps:**
- Git/GitHub para control de versiones
- GitHub Actions para CI/CD
- Vercel/Railway para deployment
- ESLint + Prettier para code quality

---

## 📊 Proceso de Trabajo

1. Historia cumple DoR → Pasa a **Ready (Refined)**
2. Se incluye en Sprint Planning → Pasa a **Sprint Backlog**
3. Desarrollador inicia trabajo → Pasa a **In Progress**
4. Historia cumple DoD → Pasa a **Done**

---

*Última actualización: Enero 2026*
