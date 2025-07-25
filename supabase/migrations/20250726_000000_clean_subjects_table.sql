-- Remove "General" and "Other" from subjects table as they are UI options, not actual subjects
DELETE FROM subjects WHERE name IN ('General', 'Other'); 