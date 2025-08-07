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
    
    // Usar período personalizado si se proporciona, sino usar fecha actual
    let period, billingStart, billingEnd;
    
    if (req.body.customPeriod) {
      // Usar período personalizado (formato: "2025-07")
      period = req.body.customPeriod;
      const [year, month] = period.split('-');
      billingStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      billingEnd = new Date(parseInt(year), parseInt(month), 0);
    } else {
      // Usar fecha actual para el período
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      period = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      
      // Definir inicio y fin del período de facturación (mes actual)
      billingStart = new Date(currentYear, currentMonth - 1, 1);
      billingEnd = new Date(currentYear, currentMonth, 0);
    }

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
      'AUD', // currency
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

// GET /api/energy-consumption/dashboard/:userId - Obtener datos para el dashboard
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Getting dashboard data for user: ${userId}`);

    // 1. Obtener información del household del usuario
    const householdQuery = `
      SELECT 
        property_type,
        square_meters,
        occupants_count,
        location_city,
        location_country,
        created_at
      FROM households 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const householdResult = await pool.query(householdQuery, [userId]);
    
    if (householdResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No household data found for this user' 
      });
    }
    
    const household = householdResult.rows[0];

    // 2. Obtener consumo energético del mes actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentPeriod = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    const currentMonthQuery = `
      SELECT 
        cost_amount,
        gas_usage,
        water_usage,
        kwh_consumed,
        notes,
        billing_period_start,
        billing_period_end,
        logged_at
      FROM energy_consumption 
      WHERE user_id = $1 AND period = $2
      ORDER BY logged_at DESC 
      LIMIT 1
    `;
    
    const currentMonthResult = await pool.query(currentMonthQuery, [userId, currentPeriod]);

    // 3. Obtener el primer registro del usuario (baseline) para calcular progreso
    const baselineQuery = `
      SELECT 
        cost_amount,
        gas_usage,
        water_usage,
        kwh_consumed,
        period,
        logged_at
      FROM energy_consumption 
      WHERE user_id = $1
      ORDER BY logged_at ASC 
      LIMIT 1
    `;
    
    const baselineResult = await pool.query(baselineQuery, [userId]);

    // 4. Procesar datos del mes actual
    let currentMonthData = {
      electricity: 0,
      gas: 0,
      water: 0,
      total: 0,
      kwh: 0,
      period: currentPeriod,
      hasData: false
    };

    if (currentMonthResult.rows.length > 0) {
      const current = currentMonthResult.rows[0];
      currentMonthData = {
        electricity: parseFloat(current.cost_amount) || 0,
        gas: parseFloat(current.gas_usage) || 0,
        water: parseFloat(current.water_usage) || 0,
        total: (parseFloat(current.cost_amount) || 0) + 
               (parseFloat(current.gas_usage) || 0) + 
               (parseFloat(current.water_usage) || 0),
        kwh: parseFloat(current.kwh_consumed) || 0,
        period: currentPeriod,
        hasData: true,
        lastUpdated: current.logged_at
      };
    }

    // 5. Calcular progreso vs baseline (primer registro del usuario)
    let savings = {
      percentage: 0,
      amount: 0,
      hasComparison: false,
      comparisonType: 'none'
    };

    // Si el usuario tiene datos actuales
    if (currentMonthData.hasData) {
      // Si hay baseline (primer registro) disponible
      if (baselineResult.rows.length > 0) {
        const baseline = baselineResult.rows[0];
        const baselineTotal = (parseFloat(baseline.cost_amount) || 0) + 
                             (parseFloat(baseline.gas_usage) || 0) + 
                             (parseFloat(baseline.water_usage) || 0);
        
        if (baselineTotal > 0) {
          const difference = baselineTotal - currentMonthData.total;
          const isFirstMonth = baseline.period === currentMonthData.period;
          
          savings = {
            percentage: Math.round((difference / baselineTotal) * 100 * 10) / 10, // Redondear a 1 decimal
            amount: Math.round(difference * 100) / 100, // Redondear a 2 decimales
            hasComparison: true,
            comparisonType: isFirstMonth ? 'first_month' : 'vs_baseline',
            baselineTotal: baselineTotal,
            baselinePeriod: baseline.period
          };
        }
      }
    }

    // 6. Extraer información de la meta energética
    let goal = {
      type: 'not_set',
      target: 0,
      hasRenewableEnergy: false
    };

    if (currentMonthResult.rows.length > 0) {
      const notes = currentMonthResult.rows[0].notes || '';
      
      // Extraer meta de las notas
      if (notes.includes('reduce_10')) goal.type = 'reduce_10', goal.target = 10;
      else if (notes.includes('reduce_20')) goal.type = 'reduce_20', goal.target = 20;
      else if (notes.includes('reduce_30')) goal.type = 'reduce_30', goal.target = 30;
      else if (notes.includes('carbon_neutral')) goal.type = 'carbon_neutral', goal.target = 100;
      
      // Verificar energía renovable
      goal.hasRenewableEnergy = notes.includes('Uses renewable energy');
    }

    // 7. Generar saludo dinámico
    const hour = currentDate.getHours();
    let greeting = 'Good morning! 🌅';
    if (hour >= 12 && hour < 18) greeting = 'Good afternoon! ☀️';
    else if (hour >= 18) greeting = 'Good evening! 🌙';

    // 8. Formatear ubicación
    let location = 'Unknown';
    if (household.location_city && household.location_country) {
      location = `${household.location_city}, ${household.location_country}`;
    } else if (household.location_city) {
      location = household.location_city;
    }

    // 9. Construir respuesta
    const dashboardData = {
      user: {
        greeting: greeting,
        location: location
      },
      household: {
        type: household.property_type,
        area: parseFloat(household.square_meters) || 0,
        occupants: parseInt(household.occupants_count) || 0,
        location: location
      },
      currentMonth: currentMonthData,
      savings: savings,
      goal: goal,
      streak: 0, // TODO: Implementar sistema de streak más adelante
      lastActivity: currentMonthData.hasData ? currentMonthData.lastUpdated : null
    };

    console.log('Dashboard data prepared:', dashboardData);

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
