require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeUserAdmin(email) {
  try {
    console.log(`Making user ${email} an admin...`);

    // First, get the user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    console.log(`Found user: ${user.id}`);

    // Update the profile to make them an admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id)
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    console.log(`Successfully made ${email} an admin!`);
    console.log('Updated profile:', data);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address:');
  console.error('node scripts/make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email); 