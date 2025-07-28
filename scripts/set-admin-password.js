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

async function setAdminPassword(email, newPassword) {
  try {
    console.log(`Setting password for admin account ${email}...`);

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

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (error) {
      console.error('Error updating password:', error);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    console.log('🆔 User ID:', user.id);
    console.log('');
    console.log('🔐 You can now login at: http://localhost:3000/admin/login');
    console.log('⚠️  Please save this password securely!');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Set password for support@tusai.app
const email = 'support@tusai.app';
const password = generatePassword();

console.log('🚀 Setting password for admin account...');
console.log('📧 Email:', email);
console.log('🔑 Generated password:', password);
console.log('');

setAdminPassword(email, password); 