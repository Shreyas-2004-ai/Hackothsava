// Debug script to test the family member system
// Run this with: node debug-family-system.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

console.log('🔍 Debugging Family Member System...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('- Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- Supabase Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('- Resend API Key:', resendApiKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials. Please check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSystem() {
  try {
    console.log('🔍 Testing Supabase Connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('family_members').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Database Error:', error.message);
      
      if (error.message.includes('relation "family_members" does not exist')) {
        console.log('\n💡 Solution: The family_members table doesn\'t exist.');
        console.log('   Run the family schema setup:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Open SQL Editor');
        console.log('   3. Run the contents of database/family-schema.sql');
        console.log('');
      }
      
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log(`✅ family_members table exists with ${data || 0} records`);
    
    // Test other tables
    const tables = ['family_relationships', 'family_stats', 'family_activities'];
    
    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
          
        if (tableError) {
          console.log(`❌ Table ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ Table ${table}: exists with ${tableData || 0} records`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    console.log('\n🧪 Testing API Endpoint...');
    
    // Test the API endpoint
    const testData = {
      name: "Debug Test User",
      relation: "Brother",
      email: "debug@test.com",
      phone: "1234567890",
      customFields: {
        field1: "01/01/1990",
        field2: "Test City",
        field3: "Engineer",
        field4: "B.Tech",
        field5: "1234567890"
      },
      addedBy: "Debug Admin",
      addedById: "debug-admin-123"
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/add-family-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Response:', result);
      } else {
        const errorText = await response.text();
        console.log('❌ API Error:', response.status, errorText);
      }
      
    } catch (apiError) {
      console.log('❌ API Connection Error:', apiError.message);
      console.log('💡 Make sure your development server is running on port 3000');
    }
    
  } catch (error) {
    console.log('❌ Debug Error:', error.message);
  }
}

debugSystem();