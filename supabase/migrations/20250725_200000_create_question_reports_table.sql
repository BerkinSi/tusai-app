-- Create question_reports table
CREATE TABLE IF NOT EXISTS question_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  question_id TEXT NOT NULL,
  quiz_id TEXT,
  question_text TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_reports_user_id ON question_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_created_at ON question_reports(created_at);

-- Enable RLS
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert their own reports" ON question_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" ON question_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON question_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all reports" ON question_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  ); 