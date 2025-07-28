const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Add the service role key manually for this script
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbHpxcnd2bGRsbmd1em9tam5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY0NDkyNywiZXhwIjoyMDY5MjIwOTI3fQ.VioEKG8QaSpovY-SHTeZZXLg4eDxbmqsWuKGfWyyGz8';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
  try {
    console.log('🔍 Checking current RLS policies...\n');

    // Get all policies on profiles table using raw SQL
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'profiles'
        `
      });

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
      return;
    }

    console.log('\n📜 Current Policies on profiles table:');
    console.log('=====================================');
    
    if (policies && policies.length > 0) {
      policies.forEach((policy, index) => {
        console.log(`${index + 1}. Policy Name: ${policy.policyname}`);
        console.log(`   Table: ${policy.schemaname}.${policy.tablename}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   Qual: ${policy.qual}`);
        console.log(`   With Check: ${policy.with_check}`);
        console.log('   ---');
      });
    } else {
      console.log('No policies found on profiles table');
    }

    // Test a simple query to see if it works
    console.log('\n🧪 Testing simple profile query...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin')
        .limit(1);

      if (testError) {
        console.error('❌ Test query failed:', testError);
      } else {
        console.log('✅ Test query successful:', testData);
      }
    } catch (error) {
      console.error('❌ Test query exception:', error);
    }

    // Test admin user specifically
    console.log('\n🧪 Testing admin user query...');
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('id, full_name, is_admin')
        .eq('id', 'a73580c9-e750-410a-a206-41b71e7face8')
        .single();

      if (adminError) {
        console.error('❌ Admin query failed:', adminError);
      } else {
        console.log('✅ Admin query successful:', adminData);
      }
    } catch (error) {
      console.error('❌ Admin query exception:', error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkPolicies(); 