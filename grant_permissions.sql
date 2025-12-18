-- Grant all privileges on the brainspark database to brainspark_user
GRANT ALL PRIVILEGES ON DATABASE brainspark TO brainspark_user;

-- Grant all privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO brainspark_user;

-- Grant all privileges on all sequences in the public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO brainspark_user;

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO brainspark_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO brainspark_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO brainspark_user;
