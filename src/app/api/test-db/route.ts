import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...');
    
    // Test 2: Check if subjects table exists and has data
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(5);
    
    if (subjectsError) {
      console.error('Subjects table error:', subjectsError);
      return NextResponse.json({ error: 'Subjects table error', details: subjectsError });
    }
    
    // Test 3: Check notes table structure - try to select all columns
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, user_id, title, content, subject, subject_id, tags, created_at, updated_at')
      .limit(1);
    
    if (notesError) {
      console.error('Notes table error:', notesError);
      return NextResponse.json({ error: 'Notes table error', details: notesError });
    }
    
    // Test 4: Try to insert a test note to see what happens
    const testNote = {
      user_id: 'test-user-id',
      title: 'Test Note',
      content: 'Test content',
      subject: 'Test Subject',
      tags: ['test']
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('notes')
      .insert(testNote)
      .select();
    
    if (insertError) {
      console.error('Insert test error:', insertError);
      return NextResponse.json({ 
        success: true,
        subjectsCount: subjects?.length || 0,
        subjects: subjects,
        notesCount: notes?.length || 0,
        notesSample: notes,
        insertError: insertError
      });
    }
    
    // Clean up test note
    if (insertResult && insertResult[0]) {
      await supabase.from('notes').delete().eq('id', insertResult[0].id);
    }
    
    return NextResponse.json({ 
      success: true,
      subjectsCount: subjects?.length || 0,
      subjects: subjects,
      notesCount: notes?.length || 0,
      notesSample: notes,
      insertSuccess: true
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: 'Test failed', details: error });
  }
} 