#!/usr/bin/env python3
"""
BrainSpark Database Setup Script
Creates the database and runs schema migrations on siggmatraders PostgreSQL server
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

# Database connection details
DB_HOST = "10.160.0.3"
DB_PORT = "5432"
DB_USER = "trading_user"
DB_PASSWORD = "SiggmaTraders2025Prod"
DB_NAME = "brainspark"

def create_database():
    """Create the brainspark database if it doesn't exist"""
    print("Connecting to PostgreSQL server...")

    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()

        if exists:
            print(f"Database '{DB_NAME}' already exists")
        else:
            print(f"Creating database '{DB_NAME}'...")
            cursor.execute(f"CREATE DATABASE {DB_NAME} OWNER {DB_USER}")
            print(f"✓ Database '{DB_NAME}' created successfully")

        cursor.close()
        conn.close()
        return True

    except Exception as e:
        print(f"✗ Error creating database: {e}")
        return False

def run_schema():
    """Run the schema.sql file to create tables"""
    print(f"\nConnecting to '{DB_NAME}' database...")

    try:
        # Connect to the brainspark database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()

        # Read schema file
        print("Reading schema file...")
        with open("database/schema.sql", "r") as f:
            schema_sql = f.read()

        # Execute schema
        print("Executing schema...")
        cursor.execute(schema_sql)
        conn.commit()

        print("✓ Schema created successfully")

        # Verify tables
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()

        print(f"\n✓ Created {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")

        cursor.close()
        conn.close()
        return True

    except Exception as e:
        print(f"✗ Error running schema: {e}")
        return False

def main():
    print("=" * 60)
    print("BrainSpark Database Setup")
    print("=" * 60)

    # Step 1: Create database
    if not create_database():
        print("\n✗ Database setup failed")
        sys.exit(1)

    # Step 2: Run schema
    if not run_schema():
        print("\n✗ Schema migration failed")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✓ Database setup completed successfully!")
    print("=" * 60)
    print(f"\nConnection string:")
    print(f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

if __name__ == "__main__":
    main()
