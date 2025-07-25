require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function makeAdmin(userEmail) {
  try {
    // First, get the user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }

    const user = users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      console.log('Available users:');
      users.forEach(u => console.log(`- ${u.email}`));
      return;
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Update the profile to make them admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return;
    }

    console.log(`✅ Successfully made ${userEmail} an admin!`);
    console.log('You can now access the admin panel at: http://localhost:3000/admin/reports');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('Usage: node scripts/make-admin.js <user-email>');
  console.log('Example: node scripts/make-admin.js support@tusai.app');
  process.exit(1);
}

makeAdmin(userEmail); 