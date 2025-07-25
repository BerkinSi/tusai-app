-- Drop existing RLS policy and recreate it properly
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;

-- Create a more permissive RLS policy for testing
CREATE POLICY "Users can manage their own notes" ON notes
  FOR ALL USING (user_id = auth.uid());

-- Also add a policy for service role if needed
CREATE POLICY "Service role can manage notes" ON notes
  FOR ALL USING (true); 