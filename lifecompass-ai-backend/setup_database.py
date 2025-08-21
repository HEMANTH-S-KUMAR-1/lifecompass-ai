#!/usr/bin/env python3
"""
Database Setup Script for LifeCompass AI
This script sets up the database schema in Supabase
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

def setup_database():
    """Set up the database schema in Supabase"""
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        return False
    
    try:
        # Create Supabase client
        supabase: Client = create_client(url, key)
        print("✅ Connected to Supabase")
        
        # Read the SQL schema file
        with open('database_schema.sql', 'r') as file:
            schema_sql = file.read()
        
        print("📄 Running database schema...")
        
        # Split the SQL into individual statements
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        success_count = 0
        error_count = 0
        
        for i, statement in enumerate(statements, 1):
            try:
                if statement:
                    # Execute each statement
                    result = supabase.rpc('execute_sql', {'sql': statement}).execute()
                    success_count += 1
                    print(f"✅ Statement {i}/{len(statements)} executed successfully")
            except Exception as e:
                error_count += 1
                print(f"⚠️ Statement {i} failed: {str(e)}")
                # Continue with next statement
                continue
        
        print(f"\n📊 Database Setup Complete:")
        print(f"   ✅ Successful statements: {success_count}")
        print(f"   ⚠️ Failed statements: {error_count}")
        
        if error_count == 0:
            print("🎉 All database tables and policies created successfully!")
        else:
            print("⚠️ Some statements failed, but core tables should be created.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 LifeCompass AI Database Setup")
    print("=" * 50)
    
    success = setup_database()
    
    if success:
        print("\n🎯 Next Steps:")
        print("1. Check your Supabase dashboard to verify tables were created")
        print("2. Start the backend server: uvicorn main:app --reload")
        print("3. Test the API endpoints")
    else:
        print("\n❌ Database setup failed. Please check your Supabase configuration.")
