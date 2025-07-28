-- Enhance schema for image-based questions and ML capabilities
-- This migration creates questions table and adds image/ML support

-- 1. Create questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id INTEGER REFERENCES subjects(id),
  user_id UUID REFERENCES auth.users(id),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  image_url TEXT, -- URL to stored image
  image_alt_text TEXT, -- Accessibility description
  image_analysis JSONB, -- ML analysis results
  source VARCHAR(100) DEFAULT 'manual', -- 'osym', 'ai_generated', 'user_upload'
  source_year INTEGER, -- Year of original exam
  tags TEXT[], -- For categorization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create images table if it doesn't exist
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  processed_url TEXT, -- After watermark removal/processing
  file_size INTEGER,
  dimensions JSONB, -- {width: 800, height: 600}
  format VARCHAR(10), -- 'jpg', 'png', 'pdf'
  ocr_text TEXT, -- Extracted text from image
  ml_analysis JSONB, -- AI analysis results
  copyright_info TEXT, -- Copyright/usage restrictions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create ml_training_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS ml_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  training_features JSONB, -- Extracted features for ML
  model_version VARCHAR(50),
  accuracy_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create quiz_questions junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_answer INTEGER,
  is_correct BOOLEAN,
  time_spent INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_image_url ON questions(image_url);
CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_images_question_id ON images(question_id);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_image_id ON ml_training_data(image_id);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_question_id ON ml_training_data(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_id ON quiz_questions(question_id);

-- 6. Enable RLS on tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for questions
CREATE POLICY "Users can view their own questions" ON questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON questions
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for images
CREATE POLICY "Users can view images for their questions" ON images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = images.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images for their questions" ON images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = images.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images for their questions" ON images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = images.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for their questions" ON images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = images.question_id 
      AND questions.user_id = auth.uid()
    )
  );

-- 9. Create RLS policies for ml_training_data
CREATE POLICY "Users can view their ml_training_data" ON ml_training_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = ml_training_data.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their ml_training_data" ON ml_training_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = ml_training_data.question_id 
      AND questions.user_id = auth.uid()
    )
  );

-- 10. Create RLS policies for quiz_questions
CREATE POLICY "Users can view their quiz_questions" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_questions.quiz_id 
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their quiz_questions" ON quiz_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_questions.quiz_id 
      AND quizzes.user_id = auth.uid()
    )
  );
