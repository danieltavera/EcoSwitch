const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const authRoutes = require('./routes/auth');
const householdsRoutes = require('./routes/households');
const energyConsumptionRoutes = require('./routes/energy-consumption');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Configurar trust proxy para ngrok
app.set('trust proxy', true);

// Middleware de seguridad
app.use(helmet());

// Rate limiting - Disabled in development due to trust proxy conflict
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests por ventana
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  });
  app.use(limiter);
}

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:19006', 'http://localhost:8081'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EcoSwitch API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/households', householdsRoutes);
app.use('/api/energy-consumption', energyConsumptionRoutes);
app.use('/api/notifications', notificationsRoutes);

// Root endpoint - Redirect to Expo Go
app.get('/', (req, res) => {
  const userAgent = req.get('User-Agent') || '';
  const isAPI = req.get('Accept')?.includes('application/json');
  
  // If it's an API request (like curl), return JSON
  if (isAPI || userAgent.includes('curl')) {
    return res.json({ 
      message: '🌱 Welcome to EcoSwitch API',
      status: 'online',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth/*',
        households: '/api/households/*',
        energyConsumption: '/api/energy-consumption/*'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Get current ngrok URL dynamically
  const ngrokUrl = req.get('host');
  const protocol = req.secure ? 'https' : 'http';
  const currentUrl = `${protocol}://${ngrokUrl}`;
  
  // Build Expo URLs dynamically
  const localExpoUrl = 'exp://192.168.68.70:8081';
  const tunnelExpoUrl = `exp://${ngrokUrl.replace('.ngrok-free.app', '')}.exp.direct:80`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>EcoSwitch - Open in Expo Go</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container { 
          text-align: center;
          padding: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .logo { 
          font-size: 80px; 
          margin-bottom: 20px; 
        }
        h1 { 
          font-size: 32px;
          margin: 20px 0;
          font-weight: 300;
        }
        .btn {
          background: #4CAF50;
          color: white;
          padding: 20px 40px;
          border: none;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin: 30px 0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        }
        .btn:hover { 
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(76, 175, 80, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌱</div>
        <h1>EcoSwitch</h1>
        <a href="${localExpoUrl}" class="btn">📱 Open in Expo Go</a>
      </div>
      
      <script>
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '${localExpoUrl}';
        }, 3000);
      </script>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EcoSwitch API ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Network: http://192.168.68.70:${PORT}/health`);
});
