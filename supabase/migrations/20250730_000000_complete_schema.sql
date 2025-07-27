-- Complete database schema for TusAI application
-- This migration creates all necessary tables, indexes, RLS policies, and triggers

-- 1. Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined TUS subjects
INSERT INTO subjects (name) VALUES
  ('Anatomi'),
  ('Histoloji ve Embriyoloji'),
  ('Fizyoloji'),
  ('Biyokimya'),
  ('Mikrobiyoloji'),
  ('Patoloji'),
  ('Farmakoloji'),
  ('Tıbbi Biyoloji ve Genetik'),
  ('Dahiliye'),
  ('Pediatri'),
  ('Genel Cerrahi'),
  ('Kadın Hastalıkları ve Doğum'),
  ('Psikiyatri'),
  ('Nöroloji'),
  ('Anesteziyoloji ve Reanimasyon'),
  ('Radyoloji'),
  ('Halk Sağlığı')
ON CONFLICT (name) DO NOTHING;

-- 2. Create profiles table with all necessary fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMP WITH TIME ZONE,
  gumroad_sale_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  subject_id INTEGER REFERENCES subjects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create ai_explanations table
CREATE TABLE IF NOT EXISTS ai_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  subject_id INTEGER REFERENCES subjects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  score INTEGER,
  total_questions INTEGER,
  correct_count INTEGER,
  subjects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create question_reports table
CREATE TABLE IF NOT EXISTS question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  subject VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_explanations_user_id ON ai_explanations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_explanations_subject_id ON ai_explanations(subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_user_id ON question_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_quiz_id ON question_reports(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);

-- 8. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 10. Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Create RLS policies for ai_explanations
CREATE POLICY "Users can view their own ai_explanations" ON ai_explanations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai_explanations" ON ai_explanations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai_explanations" ON ai_explanations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai_explanations" ON ai_explanations
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Create RLS policies for quizzes
CREATE POLICY "Users can view their own quizzes" ON quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quizzes" ON quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes" ON quizzes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes" ON quizzes
  FOR DELETE USING (auth.uid() = user_id);

-- 13. Create RLS policies for question_reports
CREATE POLICY "Users can view their own question_reports" ON question_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question_reports" ON question_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question_reports" ON question_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question_reports" ON question_reports
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all question_reports" ON question_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all question_reports" ON question_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 14. Create function to get user ID by email
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  RETURN user_id;
END;
$$;

-- 15. Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 16. Create trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 17. Create function to update profile from Gumroad webhook
CREATE OR REPLACE FUNCTION update_profile_from_gumroad(
  user_email TEXT,
  sale_id TEXT,
  premium_until TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID by email
  SELECT get_user_id_by_email(user_email) INTO user_id;
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update profile with premium information
  UPDATE public.profiles
  SET 
    is_premium = TRUE,
    premium_until = update_profile_from_gumroad.premium_until,
    gumroad_sale_id = update_profile_from_gumroad.sale_id,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$; 