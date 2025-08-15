# 📧 SendGrid Setup - Guía Paso a Paso (GRATIS)

## 🎯 Configuración Rápida (5 minutos)

### 📋 Lo que necesitas:
- [ ] Email personal (Gmail, Outlook, etc.)
- [ ] 5 minutos de tiempo
- [ ] Acceso a internet

---

## 🚀 PASO 1: Crear Cuenta Gratuita

### 1.1 Registro
1. **Ir a:** https://sendgrid.com/
2. **Clic:** "Start for Free" (botón azul, esquina superior derecha)
3. **Llenar formulario:**
   ```
   📧 Email: tu_email@gmail.com
   🔒 Password: (contraseña segura)
   👤 First Name: Tu nombre
   👤 Last Name: Tu apellido
   ```
4. **Seleccionar:** "I'm new to SendGrid"
5. **Clic:** "Get Started"

### 1.2 Verificar Email
1. **Revisar bandeja de entrada** (puede tardar 1-2 minutos)
2. **Buscar email de:** "SendGrid <hello@sendgrid.com>"
3. **Clic en enlace** de verificación
4. ✅ **Confirmar** que el email fue verificado

### 1.3 Completar Perfil
```
🏢 Company: EcoSwitch (o tu empresa)
🌐 Website: https://ecoswitch.com (opcional)
👨‍💻 Role: Developer
📧 Primary use case: Transactional Email
```

---

## 🔑 PASO 2: Verificar Sender Email

### 2.1 Ir a Sender Authentication
1. **En Dashboard SendGrid** → **Settings** (menú izquierdo)
2. **Clic:** "Sender Authentication"
3. **Buscar:** "Single Sender Verification"
4. **Clic:** "Get Started"

### 2.2 Agregar tu Email
```
📝 Completar formulario:
From Name: EcoSwitch
From Email: tu_email@gmail.com  ⚠️ IMPORTANTE: EL MISMO EMAIL DE TU CUENTA
Reply To: tu_email@gmail.com
Company Address: Tu dirección (cualquiera válida)
City: Tu ciudad
State: Tu estado/provincia  
Country: Tu país
ZIP Code: Tu código postal
```

### 2.3 Verificar
1. **Clic:** "Create"
2. **Revisar email** (nuevo email de verificación)
3. **Clic en enlace** del segundo email
4. ✅ **Verificar status:** Debe mostrar "Verified" en verde

---

## 🔐 PASO 3: Crear API Key

### 3.1 Ir a API Keys
1. **Settings** → **API Keys**
2. **Clic:** "Create API Key" (botón azul)

### 3.2 Configurar API Key
```
🏷️ API Key Name: EcoSwitch-Dev
🔐 API Key Permissions: Full Access (recomendado)
```

### 3.3 Copiar API Key
1. **Clic:** "Create & View"
2. **⚠️ COPIAR INMEDIATAMENTE** la API Key (empieza con `SG.`)
   ```
   Ejemplo: SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```
3. **⚠️ GUARDAR** en lugar seguro (solo se muestra una vez)

---

## ⚙️ PASO 4: Configurar EcoSwitch

### 4.1 Editar Variables de Entorno
1. **Abrir:** `/Users/danieltavera/EcoSwitch/backend/.env`
2. **Encontrar líneas:**
   ```bash
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   FROM_EMAIL=noreply@ecoswitch.com
   ```
3. **Reemplazar con tus datos:**
   ```bash
   SENDGRID_API_KEY=SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   FROM_EMAIL=tu_email@gmail.com
   ```
4. **Guardar archivo** (Cmd+S / Ctrl+S)

### 4.2 Reiniciar Servidor
```bash
# En terminal del backend (Ctrl+C para detener, luego):
npm run dev
```

### 4.3 Verificar Configuración
```bash
# Deberías ver en consola:
🚀 EcoSwitch API ejecutándose en puerto 3000
# (Sin mensaje de error sobre API key)
```

---

## 🧪 PASO 5: Test Final

### 5.1 Test de Email
```bash
# En nueva terminal:
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "tu_email@gmail.com"}'
```

### 5.2 Verificar Resultado
**✅ Success:** Verás en consola:
```bash
✅ Password reset email sent successfully to: tu_email@gmail.com
📧 SendGrid Response: 202
```

**📧 Check Email:** Revisar bandeja de entrada (y SPAM) - deberías recibir email de reset

---

## 🎉 ¡LISTO!

Si recibiste el email, **tu configuración es exitosa**.

### 📊 Verificar Quota
- **Dashboard SendGrid** → **Activity** → **Email Activity**
- **Plan Free:** 100 emails/día
- **Stats en tiempo real** de deliverability

### 🔄 Próximos Pasos
1. **Test welcome email:** Registrar nuevo usuario en la app
2. **Test reset password:** Usar flow completo desde la app
3. **Monitor deliverability:** Revisar stats en SendGrid

---

## 🆘 Si algo falla:

### ❌ No recibo emails
1. **Revisar SPAM** folder
2. **Verificar status** "Verified" en SendGrid
3. **Confirmar FROM_EMAIL** es exactamente el mismo email verificado

### ❌ Error 403
- Email no verificado en SendGrid
- API Key sin permisos

### ❌ API Key error
- API Key no empieza con `SG.`
- Reiniciar servidor después de editar `.env`

---

**💬 ¿Necesitas ayuda?** Revisar sección troubleshooting en `EMAIL_SERVICE_COMPLETE.md`

**🎯 Tiempo total:** ~5-10 minutos  
**💰 Costo:** $0 (plan gratuito)  
**📧 Emails incluidos:** 100/día
