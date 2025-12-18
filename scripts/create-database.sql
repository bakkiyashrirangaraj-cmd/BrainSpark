-- Create BrainSpark database on siggmatraders PostgreSQL server
-- Run this with: psql -h 10.160.0.3 -U trading_user -d postgres -f create-database.sql

-- Create database
CREATE DATABASE brainspark
    WITH
    OWNER = trading_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE brainspark TO trading_user;
