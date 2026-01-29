# ADR-001: Uso de JWT para Autenticación

## Estado
✅ **Aceptado**

**Fecha:** Enero 2026  
**Responsables:** Equipo de Desarrollo Task Manager  
**Revisores:** Arquitecto de Software

---

## Contexto

### Problema Identificado

El sistema Task Manager requiere un mecanismo de autenticación robusto que permita:

1. **Seguridad:** Proteger los endpoints de la API y garantizar que solo usuarios autenticados puedan acceder a sus recursos
2. **Escalabilidad:** Soportar múltiples instancias del servidor sin requerir estado compartido
3. **Experiencia de Usuario:** Mantener sesiones persistentes sin requerir re-autenticación constante
4. **Compatibilidad:** Funcionar correctamente con aplicaciones frontend modernas (SPA - Single Page Applications)

### Restricciones Técnicas

- El backend está desarrollado en Node.js con Express
- El frontend es una aplicación React que consume una API REST
- Se debe soportar refresh de tokens para sesiones de larga duración
- No se cuenta con infraestructura de Redis o bases de datos en memoria para manejar sesiones
- El despliegue se realizará en plataformas serverless/stateless (Vercel, Railway)

### Alternativas Consideradas

Durante el Sprint Planning se evaluaron las siguientes opciones:

1. **Sesiones basadas en Cookies con Express-Session**
2. **OAuth 2.0 con proveedores externos (Google, GitHub)**
3. **JSON Web Tokens (JWT)**

---

## Decisión

**Adoptamos JWT (JSON Web Tokens) como mecanismo principal de autenticación.**

### Implementación Específica

- **Access Token:** JWT firmado con HS256, válido por 1 hora
- **Refresh Token:** JWT separado, válido por 30 días (solo si usuario selecciona "Recordar sesión")
- **Almacenamiento Frontend:** Access token en memoria (state), refresh token en localStorage
- **Librería:** `jsonwebtoken` v9.x para Node.js
- **Middleware:** Verificación de token en cada request protegido
- **Secret Key:** Variable de entorno `JWT_SECRET` con mínimo 256 bits de entropía

### Flujo de Autenticación
```
1. Usuario → POST /api/auth/login (email + password)
2. Backend → Valida credenciales
3. Backend → Genera access_token (1h) + refresh_token (30d)
4. Backend → Retorna ambos tokens
5. Frontend → Almacena access_token en state, refresh_token en localStorage
6. Frontend → Incluye access_token en header: Authorization: Bearer <token>
7. Si access_token expira → POST /api/auth/refresh con refresh_token
8. Backend → Valida refresh_token y genera nuevo access_token
```

---

## Consecuencias

### ✅ Consecuencias Positivas (Pros)

1. **Stateless:** No requiere almacenamiento de sesiones en el servidor
   - Facilita el escalamiento horizontal
   - Compatible con arquitecturas serverless
   - Reduce dependencia de bases de datos para sesiones

2. **Performance:** 
   - Validación local de tokens sin consultas a BD
   - Latencia reducida en cada request (solo verificación de firma)
   - No hay overhead de sincronización entre servidores

3. **Flexibilidad Cross-Domain:**
   - Tokens pueden usarse en múltiples subdominios
   - Facilita integración con aplicaciones móviles futuras
   - No sufre problemas de CORS como las cookies

4. **Información Auto-Contenida:**
   - Payload del token incluye user_id, email, roles
   - Reduce queries adicionales a la base de datos
   - Facilita implementación de autorización basada en roles

5. **Estándar de la Industria:**
   - Amplia adopción y soporte en frameworks
   - Documentación extensa y buenas prácticas bien establecidas
   - Librerías maduras y auditadas

6. **Compatibilidad con SPA:**
   - Ideal para React y aplicaciones frontend modernas
   - Manejo simple desde JavaScript
   - No depende de cookies del navegador

### ❌ Consecuencias Negativas (Contras)

1. **Imposibilidad de Revocación Inmediata:**
   - Un token válido no puede ser invalidado antes de su expiración
   - **Mitigación Implementada:** 
     - Tokens de corta duración (1 hora)
     - Implementar blacklist en Redis para casos críticos (futuro)
     - Refresh tokens pueden revocarse en BD

2. **Tamaño del Payload:**
   - Cada request incluye ~200-400 bytes adicionales en headers
   - **Impacto:** Despreciable en conexiones modernas
   - **Mitigación:** Mantener payload mínimo (solo claims esenciales)

3. **Vulnerabilidad si Secret es Comprometido:**
   - Si `JWT_SECRET` se filtra, todos los tokens pueden ser falsificados
   - **Mitigación:**
     - Secret almacenado en variables de entorno
     - Secret rotado periódicamente (cada 3 meses)
     - Nunca commitear secrets en repositorio (.env en .gitignore)

4. **Complejidad en Manejo de Refresh Tokens:**
   - Requiere lógica adicional para renovar access tokens
   - Riesgo de XSS si refresh token está en localStorage
   - **Mitigación:**
     - Refresh tokens con alcance limitado (solo renovar tokens)
     - Implementar HttpOnly cookies para refresh tokens (mejora futura)
     - Validación estricta de refresh tokens en backend

5. **No hay Estado Centralizado de Sesiones Activas:**
   - Dificulta features como "cerrar todas las sesiones"
   - **Mitigación Futura:** 
     - Implementar tabla de refresh_tokens en BD
     - Permitir revocación de refresh tokens específicos

### ⚠️ Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Plan de Mitigación |
|--------|--------------|---------|-------------------|
| Filtración de JWT_SECRET | Baja | Crítico | Rotación trimestral, auditorías de seguridad |
| XSS en frontend expone tokens | Media | Alto | Sanitización de inputs, CSP headers, access tokens en memoria |
| Token replay attacks | Baja | Medio | HTTPS obligatorio, tokens de corta duración |

---

## Alternativas Descartadas

### 1️⃣ Sesiones con Express-Session

**Por qué se descartó:**
- Requiere almacenamiento de sesiones (memoria o Redis)
- Dificulta escalamiento horizontal sin sticky sessions
- Incompatible con arquitectura serverless
- Mayor overhead de infraestructura

**Cuándo reconsiderar:**
- Si migramos a infraestructura tradicional con servidores persistentes
- Si implementamos Redis/Memcached para otros propósitos

### 2️⃣ OAuth 2.0 con Proveedores Externos

**Por qué se descartó:**
- Agrega dependencia de servicios externos (Google, GitHub)
- Requiere registro de aplicación y manejo de callbacks
- Mayor complejidad para MVP
- No todos los usuarios tienen cuentas en esos proveedores

**Cuándo reconsiderar:**
- Fase 2 del producto (mejora UX)
- Como opción adicional, no única
- Cuando tengamos recursos para mantener múltiples flujos

---

## Métricas de Éxito

Para validar que esta decisión fue correcta, monitorearemos:

- ✅ **Performance:** Latencia promedio de requests autenticados < 50ms
- ✅ **Seguridad:** Cero incidentes de tokens comprometidos en primeros 6 meses
- ✅ **Escalabilidad:** Soportar 10,000 usuarios concurrentes sin degradación
- ✅ **Developer Experience:** Reducción del 40% en tiempo de implementación de features que requieren autenticación

---

## Referencias

- [RFC 7519 - JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [jwt.io - Debugger and Libraries](https://jwt.io/)
- Documentación interna: `GOVERNANCE.md` - Sección de Seguridad

---

## Notas de Implementación

**Código de Referencia:**
- Middleware de autenticación: `backend/src/middlewares/authMiddleware.js`
- Generación de tokens: `backend/src/services/authService.js`
- Verificación en frontend: `frontend/src/context/AuthContext.jsx`

**Configuración:**
```env
JWT_SECRET=<generado-con-openssl-rand-base64-32>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d
```

---

## Historial de Cambios

| Fecha | Cambio | Responsable |
|-------|--------|-------------|
| 2026-01-29 | Creación del ADR | js5445947-cloud |

---

**Próxima Revisión:** Marzo 2026  
**Status:** Activo ✅
