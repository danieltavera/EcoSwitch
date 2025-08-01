const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const pool = require('../config/database');

// Configuración de la base de datos PostgreSQL
/* const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
}); */

// POST /api/households - Crear nuevo household
router.post('/', async (req, res) => {
  try {
    const { 
      user_id,
      homeType,
      squareMeters, 
      numberOfPeople,
      location 
    } = req.body;

    console.log('Received household data:', req.body);

    // Validaciones básicas
    if (!user_id) {
      return res.status(400).json({ 
        error: 'user_id is required' 
      });
    }

    if (!homeType) {
      return res.status(400).json({ 
        error: 'homeType is required' 
      });
    }

    // Separar location en city y country si viene como "City, Country"
    let location_city = null;
    let location_country = null;
    
    if (location && location.includes(',')) {
      const parts = location.split(',').map(part => part.trim());
      location_city = parts[0];
      location_country = parts[1];
    } else if (location) {
      location_city = location;
    }

    // Insertar en la base de datos
    const query = `
      INSERT INTO households (
        user_id, 
        property_type, 
        square_meters, 
        occupants_count, 
        location_city,
        location_country
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;

    const values = [
      user_id,
      homeType,
      squareMeters ? parseFloat(squareMeters) : null,
      numberOfPeople ? parseInt(numberOfPeople) : null,
      location_city,
      location_country
    ];

    console.log('Executing query:', query);
    console.log('With values:', values);

    const result = await pool.query(query, values);
    
    console.log('Household created successfully:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Household created successfully',
      household: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating household:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// GET /api/households/:user_id - Obtener households de un usuario
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const query = `
      SELECT * FROM households 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [user_id]);
    
    res.status(200).json({
      success: true,
      households: result.rows
    });

  } catch (error) {
    console.error('Error fetching households:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// PUT /api/households/:id - Actualizar household existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      homeType,
      squareMeters, 
      numberOfPeople,
      location 
    } = req.body;

    // Separar location
    let location_city = null;
    let location_country = null;
    
    if (location && location.includes(',')) {
      const parts = location.split(',').map(part => part.trim());
      location_city = parts[0];
      location_country = parts[1];
    } else if (location) {
      location_city = location;
    }

    const query = `
      UPDATE households 
      SET 
        property_type = $1,
        square_meters = $2,
        occupants_count = $3,
        location_city = $4,
        location_country = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      homeType,
      squareMeters ? parseFloat(squareMeters) : null,
      numberOfPeople ? parseInt(numberOfPeople) : null,
      location_city,
      location_country,
      id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Household not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Household updated successfully',
      household: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating household:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router;
