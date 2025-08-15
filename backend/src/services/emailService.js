const sgMail = require('@sendgrid/mail');

// Configurar SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Enviar email de reset de contraseña
 * @param {string} email - Email del destinatario
 * @param {string} resetToken - Token JWT para reset
 * @param {string} firstName - Nombre del usuario
 * @returns {Promise<boolean>} - True si se envió exitosamente
 */
const sendPasswordResetEmail = async (email, resetToken, firstName = 'User') => {
  try {
    // URL del frontend donde el usuario completará el reset
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@ecoswitch.com',
        name: 'EcoSwitch Team'
      },
      subject: 'Reset Your EcoSwitch Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - EcoSwitch</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2E7D32, #4CAF50); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #45a049; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌱 ECOSWITCH</div>
            <p style="margin: 10px 0 0 0; font-size: 14px;">ENERGY TRACKER</p>
          </div>
          
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            
            <p>You recently requested to reset your password for your EcoSwitch account. Click the button below to reset it:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>For security reasons, please don't share this email with anyone.</p>
            
            <p>Best regards,<br>
            The EcoSwitch Team</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} EcoSwitch - Energy Tracking Made Simple</p>
            <p>This is an automated message, please don't reply to this email.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${firstName}!
        
        You recently requested to reset your password for your EcoSwitch account.
        
        Click or copy this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The EcoSwitch Team
      `
    };

    // Enviar el email
    const response = await sgMail.send(msg);
    
    console.log('✅ Password reset email sent successfully to:', email);
    console.log('📧 SendGrid Response:', response[0].statusCode);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    
    // Log detallado del error para debugging
    if (error.response) {
      console.error('SendGrid API Error:', error.response.body);
    }
    
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Enviar email de bienvenida (bonus feature)
 * @param {string} email - Email del nuevo usuario
 * @param {string} firstName - Nombre del usuario
 * @returns {Promise<boolean>} - True si se envió exitosamente
 */
const sendWelcomeEmail = async (email, firstName = 'User') => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@ecoswitch.com',
        name: 'EcoSwitch Team'
      },
      subject: 'Welcome to EcoSwitch! 🌱',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to EcoSwitch</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2E7D32, #4CAF50); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .feature { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #4CAF50; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌱 ECOSWITCH</div>
            <p style="margin: 10px 0 0 0; font-size: 14px;">ENERGY TRACKER</p>
          </div>
          
          <div class="content">
            <h2>Welcome ${firstName}! 🎉</h2>
            
            <p>Thank you for joining EcoSwitch! We're excited to help you track and reduce your energy consumption.</p>
            
            <h3>What you can do with EcoSwitch:</h3>
            
            <div class="feature">
              <strong>📊 Track Your Usage</strong><br>
              Monitor your electricity, gas, and water consumption
            </div>
            
            <div class="feature">
              <strong>🎯 Set Goals</strong><br>
              Set reduction targets and track your progress
            </div>
            
            <div class="feature">
              <strong>💡 Get Tips</strong><br>
              Receive personalized energy-saving recommendations
            </div>
            
            <div class="feature">
              <strong>🏆 Earn Achievements</strong><br>
              Unlock badges as you reach your energy goals
            </div>
            
            <p>Ready to start your energy-saving journey? Complete your profile setup in the app!</p>
            
            <p>Best regards,<br>
            The EcoSwitch Team</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} EcoSwitch - Energy Tracking Made Simple</p>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);
    console.log('✅ Welcome email sent successfully to:', email);
    return true;
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // No lanzamos error aquí porque el welcome email es opcional
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
