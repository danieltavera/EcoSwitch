-- =====================================================
-- EcoSwitch Database: Consumption Updates Table
-- Creates table for tracking consumption updates and goal progress
-- Works with existing energy_consumption table (baseline is first record)
-- =====================================================

-- Create consumption_updates table
CREATE TABLE IF NOT EXISTS consumption_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Period information
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    
    -- Consumption data (matching ConsumptionScreen fields)
    electricity_cost DECIMAL(10,2), -- Monthly electricity bill cost
    gas_cost DECIMAL(10,2),         -- Monthly gas bill cost  
    water_cost DECIMAL(10,2),       -- Monthly water bill cost
    
    -- Additional fields for enhanced tracking (optional)
    electricity_kwh DECIMAL(10,2),     -- kWh consumed (can be estimated)
    gas_usage DECIMAL(10,2),           -- Gas usage (from existing energy_consumption)
    water_usage DECIMAL(10,2),         -- Water usage (from existing energy_consumption)
    
    -- Total cost for easy calculations
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
        COALESCE(electricity_cost, 0) + 
        COALESCE(gas_cost, 0) + 
        COALESCE(water_cost, 0)
    ) STORED,
    
    -- Goal information (can be updated)
    energy_goal VARCHAR(50), -- 'reduce_10', 'reduce_20', 'reduce_30', 'carbon_neutral'
    energy_goal_percentage INTEGER, -- Numeric percentage for calculations
    has_renewable_energy BOOLEAN DEFAULT false,
    
    -- Additional tracking
    custom_period_date DATE, -- For custom date tracking
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_period_month CHECK (period_month BETWEEN 1 AND 12),
    CONSTRAINT valid_period_year CHECK (period_year >= 2020),
    CONSTRAINT valid_goal_percentage CHECK (energy_goal_percentage >= 0 AND energy_goal_percentage <= 100),
    CONSTRAINT positive_values CHECK (
        (electricity_cost IS NULL OR electricity_cost >= 0) AND
        (gas_cost IS NULL OR gas_cost >= 0) AND
        (water_cost IS NULL OR water_cost >= 0) AND
        (electricity_kwh IS NULL OR electricity_kwh >= 0) AND
        (gas_usage IS NULL OR gas_usage >= 0) AND
        (water_usage IS NULL OR water_usage >= 0)
    ),
    
    -- Unique constraint to prevent duplicate entries for same user/period
    CONSTRAINT unique_user_period UNIQUE (user_id, period_year, period_month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consumption_updates_user_id ON consumption_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_updates_period ON consumption_updates(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_consumption_updates_user_period ON consumption_updates(user_id, period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_consumption_updates_custom_date ON consumption_updates(custom_period_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_consumption_updates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_consumption_updates_timestamp
    BEFORE UPDATE ON consumption_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_consumption_updates_timestamp();

-- =====================================================
-- Goal Progress View
-- Automatically calculates progress against baseline (first energy_consumption record)
-- =====================================================

CREATE OR REPLACE VIEW v_goal_progress AS
SELECT 
    cu.id,
    cu.user_id,
    cu.period_year,
    cu.period_month,
    
    -- Current period data
    cu.electricity_cost,
    cu.gas_cost,
    cu.water_cost,
    cu.total_cost as current_total_cost,
    cu.electricity_kwh,
    cu.gas_usage,
    cu.water_usage,
    
    -- Baseline data for comparison (first energy_consumption record)
    baseline.cost_amount as baseline_electricity_cost,
    baseline.gas_usage as baseline_gas_cost,
    baseline.water_usage as baseline_water_cost,
    (COALESCE(baseline.cost_amount, 0) + 
     COALESCE(baseline.gas_usage, 0) + 
     COALESCE(baseline.water_usage, 0)) as baseline_total_cost,
    baseline.period as baseline_period,
    baseline.logged_at as baseline_date,
    
    -- Goal information
    cu.energy_goal,
    cu.energy_goal_percentage,
    cu.has_renewable_energy,
    
    -- Progress calculations
    CASE 
        WHEN (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) > 0 THEN
            ROUND(
                (((COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) - cu.total_cost) / 
                 (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) * 100)::numeric, 
                2
            )
        ELSE 0
    END as savings_percentage,
    
    CASE 
        WHEN (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) > 0 THEN
            ROUND(((COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) - cu.total_cost)::numeric, 2)
        ELSE 0
    END as savings_amount,
    
    -- Goal achievement status
    CASE 
        WHEN cu.energy_goal_percentage IS NULL OR cu.energy_goal_percentage = 0 THEN 'no_goal'
        WHEN (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) > 0 AND 
             (((COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) - cu.total_cost) / 
              (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) * 100) >= cu.energy_goal_percentage 
        THEN 'achieved'
        WHEN (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) > 0 AND 
             (((COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) - cu.total_cost) / 
              (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) * 100) >= 0 
        THEN 'in_progress'
        ELSE 'behind'
    END as goal_status,
    
    -- Target amount to achieve goal
    CASE 
        WHEN cu.energy_goal_percentage > 0 AND (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) > 0 THEN
            ROUND(((COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) * (1 - cu.energy_goal_percentage / 100.0))::numeric, 2)
        ELSE NULL
    END as goal_target_amount,
    
    -- Remaining amount to achieve goal
    CASE 
        WHEN cu.energy_goal_percentage > 0 AND (COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) > 0 THEN
            ROUND((cu.total_cost - ((COALESCE(baseline.cost_amount, 0) + COALESCE(baseline.gas_usage, 0) + COALESCE(baseline.water_usage, 0)) * (1 - cu.energy_goal_percentage / 100.0)))::numeric, 2)
        ELSE NULL
    END as remaining_to_goal,
    
    -- Timestamps
    cu.created_at,
    cu.updated_at
    
FROM consumption_updates cu
INNER JOIN (
    -- Get baseline (first energy_consumption record for each user)
    SELECT DISTINCT ON (user_id) 
        user_id,
        cost_amount,
        gas_usage,
        water_usage,
        period,
        logged_at
    FROM energy_consumption 
    ORDER BY user_id, logged_at ASC
) baseline ON cu.user_id = baseline.user_id
ORDER BY cu.period_year DESC, cu.period_month DESC;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get latest consumption update for a user
CREATE OR REPLACE FUNCTION get_latest_consumption_update(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    period_year INTEGER,
    period_month INTEGER,
    total_cost DECIMAL,
    savings_percentage DECIMAL,
    savings_amount DECIMAL,
    goal_status TEXT,
    goal_target_amount DECIMAL,
    remaining_to_goal DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vgp.id,
        vgp.period_year,
        vgp.period_month,
        vgp.current_total_cost,
        vgp.savings_percentage,
        vgp.savings_amount,
        vgp.goal_status,
        vgp.goal_target_amount,
        vgp.remaining_to_goal
    FROM v_goal_progress vgp
    WHERE vgp.user_id = p_user_id
    ORDER BY vgp.period_year DESC, vgp.period_month DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get goal progress history for a user
CREATE OR REPLACE FUNCTION get_goal_progress_history(p_user_id UUID, p_limit INTEGER DEFAULT 12)
RETURNS TABLE (
    period_year INTEGER,
    period_month INTEGER,
    total_cost DECIMAL,
    baseline_total_cost DECIMAL,
    savings_percentage DECIMAL,
    savings_amount DECIMAL,
    goal_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vgp.period_year,
        vgp.period_month,
        vgp.current_total_cost,
        vgp.baseline_total_cost,
        vgp.savings_percentage,
        vgp.savings_amount,
        vgp.goal_status
    FROM v_goal_progress vgp
    WHERE vgp.user_id = p_user_id
    ORDER BY vgp.period_year DESC, vgp.period_month DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create baseline from energy_consumption
CREATE OR REPLACE FUNCTION get_user_baseline(p_user_id UUID)
RETURNS TABLE (
    cost_amount DECIMAL,
    gas_usage DECIMAL,
    water_usage DECIMAL,
    total_cost DECIMAL,
    period VARCHAR,
    logged_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ec.cost_amount,
        ec.gas_usage,
        ec.water_usage,
        (COALESCE(ec.cost_amount, 0) + COALESCE(ec.gas_usage, 0) + COALESCE(ec.water_usage, 0)) as total_cost,
        ec.period,
        ec.logged_at
    FROM energy_consumption ec
    WHERE ec.user_id = p_user_id
    ORDER BY ec.logged_at ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample Data and Examples
-- =====================================================

-- Example: Insert a consumption update for testing
-- This assumes you already have a user and their first energy_consumption record (baseline)
-- 
-- INSERT INTO consumption_updates (
--     user_id, 
--     period_year, 
--     period_month,
--     electricity_cost,
--     gas_cost,
--     water_cost,
--     electricity_kwh,     -- Optional, can be estimated
--     gas_usage,           -- Optional, from energy_consumption
--     water_usage,         -- Optional, from energy_consumption
--     energy_goal,
--     energy_goal_percentage,
--     has_renewable_energy,
--     custom_period_date,
--     notes
-- ) VALUES (
--     'eb5aab3b-508f-40ac-a1e5-0490f9b1aca0',  -- user_id
--     2024, 8,  -- August 2024
--     120.50,   -- Electricity cost: $120.50
--     67.80,    -- Gas cost: $67.80  
--     55.30,    -- Water cost: $55.30
--     850,      -- Electricity: 850 kWh (optional, can be estimated from cost)
--     67.80,    -- Gas usage (copied from cost for simplicity)
--     55.30,    -- Water usage (copied from cost for simplicity)
--     'reduce_20',  -- Goal type
--     20,           -- 20% reduction goal
--     false,        -- No renewable energy
--     '2024-08-15', -- Custom tracking date
--     'August consumption update via mobile app'
-- );

-- Example queries to test the system:

-- 1. View goal progress for a specific user
-- SELECT * FROM v_goal_progress WHERE user_id = 'eb5aab3b-508f-40ac-a1e5-0490f9b1aca0';

-- 2. Get latest consumption update and progress
-- SELECT * FROM get_latest_consumption_update('eb5aab3b-508f-40ac-a1e5-0490f9b1aca0');

-- 3. Get goal progress history (last 6 months)
-- SELECT * FROM get_goal_progress_history('eb5aab3b-508f-40ac-a1e5-0490f9b1aca0', 6);

-- 4. Get user's baseline from energy_consumption
-- SELECT * FROM get_user_baseline('eb5aab3b-508f-40ac-a1e5-0490f9b1aca0');

-- 5. Check what users have baseline data
-- SELECT DISTINCT user_id, COUNT(*) as total_records, MIN(logged_at) as first_record
-- FROM energy_consumption 
-- GROUP BY user_id 
-- ORDER BY first_record;

-- 6. See all consumption updates with their calculated progress
-- SELECT 
--     cu.user_id,
--     cu.period_year,
--     cu.period_month,
--     cu.total_cost,
--     vgp.baseline_total_cost,
--     vgp.savings_percentage,
--     vgp.goal_status
-- FROM consumption_updates cu
-- JOIN v_goal_progress vgp ON cu.id = vgp.id
-- ORDER BY cu.user_id, cu.period_year DESC, cu.period_month DESC;
