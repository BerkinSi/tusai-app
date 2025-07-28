const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Add the service role key manually for this script
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbHpxcnd2bGRsbmd1em9tam5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY0NDkyNywiZXhwIjoyMDY5MjIwOTI3fQ.VioEKG8QaSpovY-SHTeZZXLg4eDxbmqsWuKGfWyyGz8';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

async function makeExistingUserAdmin(email) {
  try {
    console.log(`Making existing user ${email} an admin...`);

    // Get all users
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      console.log('Available users:');
      users.forEach(u => console.log(`- ${u.email}`));
      return;
    }

    console.log(`Found user: ${user.id} (${user.email})`);

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileCheckError);
      return;
    }

    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          is_admin: true,
          is_premium: true,
          full_name: existingProfile.full_name || 'Admin User'
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }

      console.log('✅ Successfully made existing user an admin!');
      console.log('📧 Email:', email);
      console.log('🆔 User ID:', user.id);
      console.log('👤 Profile updated:', updatedProfile);
      
    } else {
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: 'Admin User',
          is_admin: true,
          is_premium: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return;
      }

      console.log('✅ Successfully created admin profile!');
      console.log('📧 Email:', email);
      console.log('🆔 User ID:', user.id);
      console.log('👤 Profile created:', newProfile);
    }

    console.log('');
    console.log('🔐 You can now login at: http://localhost:3000/admin/login');
    console.log('⚠️  Use your existing password to login!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Make support@tusai.app an admin
const email = 'support@tusai.app';

console.log('🚀 Making existing user an admin...');
console.log('📧 Email:', email);
console.log('');

makeExistingUserAdmin(email); 