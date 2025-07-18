-- ==============================================
-- Otorgar permisos al usuario ecoswitch_user
-- ==============================================

-- Conectar como superusuario (postgres) y ejecutar:

-- Otorgar permisos completos sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE ecoswitch_db TO ecoswitch_user;

-- Otorgar permisos sobre el esquema public
GRANT ALL PRIVILEGES ON SCHEMA public TO ecoswitch_user;

-- Otorgar permisos sobre la tabla users
GRANT ALL PRIVILEGES ON TABLE users TO ecoswitch_user;

-- Otorgar permisos sobre secuencias (para UUIDs y auto-increment)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecoswitch_user;

-- Verificar permisos
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='users';
