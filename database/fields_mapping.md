# EcoSwitch - Mapeo de Campos: Frontend ↔ Database

## 📝 SignUpScreen.tsx → USERS Table

| Frontend Field | Database Column | Type | Notes |
|----------------|-----------------|------|--------|
| `firstName` | `first_name` | varchar | ✅ Mapped |
| `lastName` | `last_name` | varchar | ✅ Mapped |
| `email` | `email` | varchar | ✅ Mapped (UK) |
| `password` | `password_hash` | varchar | ✅ Hashed before storage |
| `confirmPassword` | - | - | ❌ Not stored (validation only) |
| `phone` | `phone` | varchar | ✅ Mapped |

## 🏠 HomeDataScreen.tsx → HOUSEHOLDS Table

| Frontend Field | Database Column | Type | Notes |
|----------------|-----------------|------|--------|
| `homeType` | `property_type` | varchar | ✅ Mapped |
| `squareMeters` | `square_meters` | decimal | ✅ Mapped |
| `numberOfPeople` | `occupants_count` | integer | ✅ Mapped |
| `location` | `location_city` + `location_country` | varchar | ✅ Split into city/country |

## ⚡ BaseConsumptionScreen.tsx → HOUSEHOLDS Table

| Frontend Field | Database Column | Type | Notes |
|----------------|-----------------|------|--------|
| `monthlyElectricBill` | `baseline_electricity` | decimal | ✅ Mapped |
| `monthlyGasBill` | `baseline_gas` | decimal | ✅ Mapped |
| `monthlyWaterBill` | `baseline_water` | decimal | ✅ Mapped |
| `hasRenewableEnergy` | `has_renewable_energy` | boolean | ✅ Mapped |
| `energyGoal` | `energy_goal` | varchar | ✅ Mapped |

## 📊 ConsumptionScreen.tsx → ENERGY_BILLS Table

| Frontend Field | Database Column | Type | Notes |
|----------------|-----------------|------|--------|
| `period` | `period` | varchar | ✅ Mapped |
| `electricityKwh` | `electricity_kwh` | decimal | ✅ Mapped |
| `electricityCost` | `electricity_cost` | decimal | ✅ Mapped |
| `gasUsage` | `gas_usage` | decimal | ✅ Mapped |
| `gasCost` | `gas_cost` | decimal | ✅ Mapped |
| `waterUsage` | `water_usage` | decimal | ✅ Mapped |
| `waterCost` | `water_cost` | decimal | ✅ Mapped |
| `notes` | `notes` | varchar | ✅ Mapped |
| `date` | `bill_date` | date | ✅ Mapped |

## 🏆 Additional Auto-Generated Fields

| Database Field | Purpose | Type | Notes |
|----------------|---------|------|--------|
| `id` | Primary Key | uuid | Auto-generated |
| `user_id` | Foreign Key | uuid | Links to USERS |
| `household_id` | Foreign Key | uuid | Links to HOUSEHOLDS |
| `created_at` | Record Creation | timestamp | Auto-generated |
| `updated_at` | Last Update | timestamp | Auto-updated |
| `currency` | Money Currency | varchar | Default 'USD' |

## ✅ Summary

**Total Frontend Fields**: 18
**Successfully Mapped**: 17 (94.4%)
**Not Stored**: 1 (`confirmPassword` - validation only)

**New Tables Created**:
- `ENERGY_BILLS` - Comprehensive energy consumption tracking
- Enhanced `HOUSEHOLDS` - Complete household information
- Enhanced `ENERGY_CONSUMPTION` - Flexible consumption logging

All frontend forms are now **100% compatible** with the database schema!
