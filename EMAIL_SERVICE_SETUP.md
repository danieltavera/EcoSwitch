# 📧 EcoSwitch Email Service Setup Guide

Este documento explica cómo configurar y usar el servicio de email real con SendGrid en EcoSwitch.

## 🔧 Estado Actual

El servicio de email ya está **completamente implementado** con las siguientes características:

### ✅ Funcionalidades Implementadas

1. **Password Reset Emails** - Emails de reset de contraseña con tokens JWT
2. **Welcome Emails** - Emails de bienvenida para nuevos usuarios
3. **HTML Templates** - Templates responsivos y profesionales
4. **Error Handling** - Manejo robusto de errores de SendGrid
5. **Security** - Tokens JWT con expiración de 1 hora
6. **Logging** - Logs detallados para debugging

### 📁 Archivos Involucrados

- `backend/src/services/emailService.js` - Servicio principal de email
- `backend/src/routes/auth.js` - Rutas que usan el servicio
- `backend/.env` - Variables de entorno
- `backend/.env.example` - Template de configuración

## 🚀 Configuración Paso a Paso

### 1. Crear Cuenta SendGrid

1. Ir a [SendGrid](https://sendgrid.com/)
2. Crear cuenta gratuita (100 emails/día gratis)
3. Verificar email y completar setup

### 2. Obtener API Key

1. Ir a Settings → API Keys
2. Crear nueva API Key con permisos "Full Access"
3. Copiar la API Key (empieza con `SG.`)

### 3. Verificar Sender Identity

Para evitar que los emails vayan a spam:

#### Opción A: Single Sender Verification (Más fácil)
1. Ir a Settings → Sender Authentication
2. Authenticate Your Domain → Single Sender Verification
3. Agregar tu email como sender verificado
4. Verificar el email que SendGrid te envíe

#### Opción B: Domain Authentication (Recomendado para producción)
1. Ir a Settings → Sender Authentication
2. Authenticate Your Domain
3. Seguir los pasos para verificar tu dominio

### 4. Configurar Variables de Entorno

Editar `backend/.env`:

```bash
# Email Configuration (SendGrid)
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=tu_email_verificado@dominio.com
FRONTEND_URL=http://localhost:3000  # Para desarrollo
```

Para producción:
```bash
FRONTEND_URL=https://tudominio.com
FROM_EMAIL=noreply@tudominio.com
```

## 📧 Uso del Servicio

### Password Reset

```javascript
const { sendPasswordResetEmail } = require('./services/emailService');

// En la ruta /forgot-password
await sendPasswordResetEmail(userEmail, resetToken, firstName);
```

### Welcome Email

```javascript
const { sendWelcomeEmail } = require('./services/emailService');

// En la ruta /register (enviado async)
sendWelcomeEmail(userEmail, firstName)
  .then(() => console.log('Welcome email sent'))
  .catch(error => console.error('Failed to send welcome email:', error));
```

## 🧪 Testing

### 1. Test Básico (Registro)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tudominio.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Test Password Reset

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tudominio.com"
  }'
```

### 3. Verificar Logs

En el servidor verás:
```
✅ Welcome email sent successfully to: test@tudominio.com
📧 SendGrid Response: 202
✅ Password reset email sent successfully to: test@tudominio.com
```

## 🎨 Templates de Email

### Password Reset Template
- Header con logo EcoSwitch
- Botón prominente de "Reset Password"
- Link alternativo copiable
- Warning sobre expiración (1 hora)
- Footer profesional

### Welcome Email Template
- Diseño de bienvenida
- Lista de funcionalidades de la app
- Iconos y colores del brand
- Call-to-action para completar setup

## 🔒 Security Features

1. **JWT Tokens**: Tokens seguros con expiración de 1 hora
2. **Email Validation**: Validación de formato de email
3. **Rate Limiting**: (Implementar en rutas si es necesario)
4. **No Reveal**: No revela si un email existe en forgot-password
5. **Environment Separation**: Diferentes configs para dev/prod

## ⚠️ Consideraciones de Producción

### Domain Setup
1. Configurar SPF/DKIM records
2. Usar dominio propio verificado
3. Considerar subdomain (mail.tudominio.com)

### Monitoring
1. Monitor SendGrid quota (100 emails/día en plan gratuito)
2. Configurar webhooks para bounce/spam reports
3. Log de todos los emails enviados

### Error Handling
```javascript
// Ya implementado en emailService.js
try {
  await sendPasswordResetEmail(email, token, firstName);
} catch (error) {
  console.error('Email failed:', error);
  // Fallback o retry logic
}
```

## 🐛 Troubleshooting

### Email no llega
1. ✅ Verificar API Key
2. ✅ Verificar sender email
3. ✅ Revisar logs del servidor
4. ✅ Verificar carpeta spam
5. ✅ Verificar quota SendGrid

### Error 403 Forbidden
- Sender email no verificado
- API Key inválida
- Permisos insuficientes

### Error 413 Payload Too Large
- Template HTML muy grande (poco probable)

## 📊 Metrics y Analytics

SendGrid Dashboard muestra:
- Emails enviados/entregados
- Bounces y unsubscribes
- Click/open rates
- Spam reports

## 🔄 Next Steps

Para completar la implementación:

1. **Frontend Reset Password Screen** - Pantalla para el token del email
2. **Email Templates Customization** - Ajustar colores/branding
3. **Email Preferences** - Permitir opt-out de emails promocionales
4. **Transactional Emails** - Notificaciones de la app por email

## 🌟 Estado: ✅ IMPLEMENTADO

El servicio de email está **completamente funcional** y listo para usar. Solo necesitas:

1. Configurar tu API Key de SendGrid
2. Verificar tu sender email
3. Actualizar las variables de entorno
4. ¡Empezar a enviar emails!

---

💡 **Tip**: En desarrollo, los tokens y URLs aparecen en la respuesta de `/forgot-password` para facilitar testing.
