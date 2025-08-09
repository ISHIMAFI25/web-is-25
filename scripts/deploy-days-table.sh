#!/bin/bash

# Script untuk deploy database days table
echo "🚀 Deploying Days Table to Supabase..."

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
fi

# Check if Supabase URL and Key are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    exit 1
fi

echo "📊 Creating days table..."

# Execute the SQL file
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(cat database/create_days_table.sql | tr '\n' ' ' | sed 's/"/\\"/g')\"}"

if [ $? -eq 0 ]; then
    echo "✅ Days table deployed successfully!"
    echo "📋 Table includes:"
    echo "   - id (UUID, Primary Key)"
    echo "   - day_number (INTEGER, Unique)"
    echo "   - title (TEXT)"
    echo "   - description (TEXT)"
    echo "   - date_time (TIMESTAMPTZ)"
    echo "   - location (TEXT)"
    echo "   - specifications (TEXT, Optional)"
    echo "   - attachment_files (JSONB Array)"
    echo "   - is_visible (BOOLEAN)"
    echo "   - created_at (TIMESTAMPTZ)"
    echo "   - updated_at (TIMESTAMPTZ)"
    echo ""
    echo "🔒 RLS policies enabled for security"
    echo "📊 Ready to use with Day Management System"
else
    echo "❌ Failed to deploy days table"
    exit 1
fi
