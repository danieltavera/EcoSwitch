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

// POST /api/energy-consumption - Crear nuevo registro de consumo energético
router.post('/', async (req, res) => {
  try {
    const { 
      user_id,
      monthlyElectricBill,
      monthlyGasBill,
      monthlyWaterBill,
      hasRenewableEnergy,
      energyGoal
    } = req.body;

    console.log('Received energy consumption data:', req.body);

    // Validaciones básicas
    if (!user_id) {
      return res.status(400).json({ 
        error: 'user_id is required' 
      });
    }

    if (!monthlyElectricBill) {
      return res.status(400).json({ 
        error: 'monthlyElectricBill is required' 
      });
    }

    if (!energyGoal) {
      return res.status(400).json({ 
        error: 'energyGoal is required' 
      });
    }

    // Convertir valores de string a números
    const electricityBill = parseFloat(monthlyElectricBill);
    const gasBill = monthlyGasBill ? parseFloat(monthlyGasBill) : null;
    const waterBill = monthlyWaterBill ? parseFloat(monthlyWaterBill) : null;

    // Validar que los números sean válidos
    if (isNaN(electricityBill) || electricityBill <= 0) {
      return res.status(400).json({ 
        error: 'Invalid electricity bill amount' 
      });
    }

    if (gasBill !== null && (isNaN(gasBill) || gasBill < 0)) {
      return res.status(400).json({ 
        error: 'Invalid gas bill amount' 
      });
    }

    if (waterBill !== null && (isNaN(waterBill) || waterBill < 0)) {
      return res.status(400).json({ 
        error: 'Invalid water bill amount' 
      });
    }

    // Obtener el household_id del usuario
    const householdQuery = 'SELECT id FROM households WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
    const householdResult = await pool.query(householdQuery, [user_id]);
    
    console.log('Household query result:', householdResult.rows);
    
    if (householdResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No household found for this user. Please complete the home information first.' 
      });
    }
    
    const household_id = householdResult.rows[0].id;
    console.log('Using household_id:', household_id);

    // Insertar en la base de datos
    const query = `
      INSERT INTO energy_consumption (
        user_id,
        household_id,
        energy_type,
        kwh_consumed,
        cost_amount,
        gas_usage,
        water_usage,
        period,
        billing_period_start,
        billing_period_end,
        currency,
        is_estimated,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    // Calcular estimación de kWh basada en el costo (promedio ~$0.12 por kWh)
    const estimatedKwh = Math.round(electricityBill / 0.12);
    
    // Usar fecha actual para el período
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const period = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    // Definir inicio y fin del período de facturación (mes actual)
    const billingStart = new Date(currentYear, currentMonth - 1, 1);
    const billingEnd = new Date(currentYear, currentMonth, 0);

    const values = [
      user_id,
      household_id, // Agregado household_id
      'electricity', // energy_type
      estimatedKwh, // kwh_consumed
      electricityBill, // cost_amount
      gasBill, // gas_usage
      waterBill, // water_usage
      period, // period
      billingStart, // billing_period_start
      billingEnd, // billing_period_end
      'USD', // currency
      true, // is_estimated (basado en cálculo de $0.12/kWh)
      `Energy goal: ${energyGoal}${hasRenewableEnergy ? ', Uses renewable energy' : ''}` // notes
    ];

    const result = await pool.query(query, values);
    const energyConsumption = result.rows[0];

    console.log('Energy consumption created successfully:', energyConsumption);

    res.status(201).json({
      message: 'Energy consumption data saved successfully',
      data: {
        id: energyConsumption.id,
        user_id: energyConsumption.user_id,
        household_id: energyConsumption.household_id,
        period: energyConsumption.period,
        energy_type: energyConsumption.energy_type,
        kwh_consumed: energyConsumption.kwh_consumed,
        cost_amount: energyConsumption.cost_amount,
        gas_usage: energyConsumption.gas_usage,
        water_usage: energyConsumption.water_usage,
        currency: energyConsumption.currency,
        is_estimated: energyConsumption.is_estimated,
        notes: energyConsumption.notes,
        billing_period_start: energyConsumption.billing_period_start,
        billing_period_end: energyConsumption.billing_period_end
      }
    });

  } catch (error) {
    console.error('Error creating energy consumption:', error);
    
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: 'Invalid user_id. User does not exist.' 
      });
    }
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Energy consumption data for this user and period already exists' 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/energy-consumption/:userId - Obtener consumo energético de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month, limit = 12 } = req.query;

    let query = `
      SELECT 
        id,
        user_id,
        household_id,
        period,
        energy_type,
        kwh_consumed,
        cost_amount,
        gas_usage,
        water_usage,
        currency,
        billing_period_start,
        billing_period_end,
        logged_at,
        notes,
        is_estimated,
        custom_date
      FROM energy_consumption 
      WHERE user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCount = 1;

    if (year || month) {
      // Filtrar por período usando la columna 'period' que tiene formato 'YYYY-MM'
      let periodFilter = '';
      if (year && month) {
        periodFilter = `${year}-${month.toString().padStart(2, '0')}`;
        paramCount++;
        query += ` AND period = $${paramCount}`;
        queryParams.push(periodFilter);
      } else if (year) {
        paramCount++;
        query += ` AND period LIKE $${paramCount}`;
        queryParams.push(`${year}-%`);
      }
    }

    query += ` ORDER BY period DESC, logged_at DESC LIMIT $${paramCount + 1}`;
    queryParams.push(limit);

    const result = await pool.query(query, queryParams);

    res.json({
      message: 'Energy consumption data retrieved successfully',
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching energy consumption:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/energy-consumption/:id - Actualizar registro de consumo energético
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      monthlyElectricBill,
      monthlyGasBill,
      monthlyWaterBill,
      hasRenewableEnergy,
      energyGoal
    } = req.body;

    // Construir la consulta dinámicamente
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (monthlyElectricBill !== undefined) {
      const electricityBill = parseFloat(monthlyElectricBill);
      if (isNaN(electricityBill) || electricityBill <= 0) {
        return res.status(400).json({ error: 'Invalid electricity bill amount' });
      }
      paramCount++;
      updates.push(`cost_amount = $${paramCount}`);
      values.push(electricityBill);
      
      // También actualizar la estimación de kWh
      paramCount++;
      updates.push(`kwh_consumed = $${paramCount}`);
      values.push(Math.round(electricityBill / 0.12));
    }

    if (monthlyGasBill !== undefined) {
      const gasBill = monthlyGasBill ? parseFloat(monthlyGasBill) : null;
      if (gasBill !== null && (isNaN(gasBill) || gasBill < 0)) {
        return res.status(400).json({ error: 'Invalid gas bill amount' });
      }
      paramCount++;
      updates.push(`gas_usage = $${paramCount}`);
      values.push(gasBill);
    }

    if (monthlyWaterBill !== undefined) {
      const waterBill = monthlyWaterBill ? parseFloat(monthlyWaterBill) : null;
      if (waterBill !== null && (isNaN(waterBill) || waterBill < 0)) {
        return res.status(400).json({ error: 'Invalid water bill amount' });
      }
      paramCount++;
      updates.push(`water_usage = $${paramCount}`);
      values.push(waterBill);
    }

    if (hasRenewableEnergy !== undefined || energyGoal !== undefined) {
      // Actualizar las notas con la información de energía renovable y objetivo
      const currentNotes = `Energy goal: ${energyGoal || 'not specified'}${hasRenewableEnergy ? ', Uses renewable energy' : ''}`;
      paramCount++;
      updates.push(`notes = $${paramCount}`);
      values.push(currentNotes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Añadir updated_at
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    // Añadir el ID al final
    paramCount++;
    values.push(id);

    const query = `
      UPDATE energy_consumption 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Energy consumption record not found' });
    }

    const updatedRecord = result.rows[0];

    res.json({
      message: 'Energy consumption updated successfully',
      data: {
        id: updatedRecord.id,
        user_id: updatedRecord.user_id,
        period: updatedRecord.period,
        energy_type: updatedRecord.energy_type,
        kwh_consumed: updatedRecord.kwh_consumed,
        cost_amount: updatedRecord.cost_amount,
        gas_usage: updatedRecord.gas_usage,
        water_usage: updatedRecord.water_usage,
        currency: updatedRecord.currency,
        notes: updatedRecord.notes,
        is_estimated: updatedRecord.is_estimated,
        billing_period_start: updatedRecord.billing_period_start,
        billing_period_end: updatedRecord.billing_period_end
      }
    });

  } catch (error) {
    console.error('Error updating energy consumption:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
