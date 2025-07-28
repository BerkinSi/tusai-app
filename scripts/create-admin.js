const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Add the service role key manually for this script
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbHpxcnd2bGRsbmd1em9tam5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY0NDkyNywiZXhwIjoyMDY5MjIwOTI3fQ.VioEKG8QaSpovY-SHTeZZXLg4eDxbmqsWuKGfWyyGz8';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createAdminAccount(email, password) {
  try {
    console.log(`Creating admin account for ${email}...`);

    // Create the user account
    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }

    console.log(`User created: ${user.id}`);

    // Try to create profile, if it fails, update existing one
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: 'Admin User',
        is_admin: true,
        is_premium: true
      })
      .select()
      .single();

    if (profileError && profileError.code === '23505') {
      // Profile already exists, update it
      console.log('Profile already exists, updating...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Admin User',
          is_admin: true,
          is_premium: true
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return;
      }

      profile = updatedProfile;
      console.log('Profile updated successfully');
    } else if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('✅ Admin account created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 User ID:', user.id);
    console.log('');
    console.log('🔐 You can now login at: http://localhost:3000/admin/login');
    console.log('⚠️  Please save this password securely!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Create admin account for support@tusai.app
const email = 'support@tusai.app';
const password = generatePassword();

console.log('🚀 Creating admin account...');
console.log('📧 Email:', email);
console.log('🔑 Generated password:', password);
console.log('');

createAdminAccount(email, password); 