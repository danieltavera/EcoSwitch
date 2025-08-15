const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  try {
    // Validar campos requeridos
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Campos requeridos: email, password, firstName, lastName' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar usuario en la base de datos
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, phone, is_active, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, phone]
    );

    const user = result.rows[0];

    // Generar JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'ecoswitch_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Enviar email de bienvenida (async, no bloquea la respuesta)
    sendWelcomeEmail(user.email, user.first_name)
      .then(() => console.log(`✅ Welcome email sent to: ${user.email}`))
      .catch(error => console.error(`❌ Failed to send welcome email to ${user.email}:`, error.message));

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isActive: user.is_active,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario en la base de datos
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'ecoswitch_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isActive: user.is_active
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoswitch_secret_key');
    
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isActive: user.is_active
      }
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Validar que el email sea proporcionado
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Verificar si el usuario existe
    const result = await pool.query(
      'SELECT id, email, first_name FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(404).json({ error: 'If this email is registered, you will receive reset instructions shortly.' });
    }

    const user = result.rows[0];

    // Generar token de reset (válido por 1 hora)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_SECRET || 'ecoswitch_secret_key',
      { expiresIn: '1h' }
    );

    // Enviar email de reset de contraseña
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.first_name);
      console.log(`✅ Password reset email sent successfully to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // En desarrollo, mostramos el error; en producción, log interno
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          error: 'Failed to send reset email. Please try again.',
          details: emailError.message 
        });
      } else {
        // En producción, no revelar detalles del error
        return res.status(500).json({ 
          error: 'Unable to send reset email at this time. Please try again later.' 
        });
      }
    }

    // Respuesta exitosa
    res.json({
      message: 'Password reset instructions have been sent to your email.',
      // En desarrollo, incluir información adicional para testing
      ...(process.env.NODE_ENV === 'development' && { 
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
        email: user.email
      })
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validar campos requeridos
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Validar contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verificar y decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoswitch_secret_key');
      
      // Verificar que es un token de reset de contraseña
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ error: 'Invalid reset token' });
      }
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(400).json({ error: 'Reset token has expired. Please request a new password reset.' });
      } else {
        return res.status(400).json({ error: 'Invalid reset token' });
      }
    }

    // Verificar que el usuario existe y está activo
    const userResult = await pool.query(
      'SELECT id, email, first_name FROM users WHERE id = $1 AND email = $2 AND is_active = true',
      [decoded.userId, decoded.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found or inactive' });
    }

    const user = userResult.rows[0];

    // Hashear la nueva contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar la contraseña en la base de datos
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, user.id]
    );

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({
      message: 'Password reset successful. You can now log in with your new password.',
      user: {
        email: user.email,
        firstName: user.first_name
      }
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
