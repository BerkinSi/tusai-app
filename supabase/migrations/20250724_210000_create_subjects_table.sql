-- Create subjects table
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

-- Add subject_id column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON notes(subject_id); 