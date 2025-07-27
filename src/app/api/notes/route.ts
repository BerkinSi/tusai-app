import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const tag = searchParams.get('tag');

    // Build query
    let query = supabase
      .from('notes')
      .select(`
        *,
        subjects(name)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    // Apply filters
    if (subject) {
      query = query.eq('subjects.name', subject);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json(notes || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: /api/notes - Starting POST request');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('API: /api/notes - No authorization header');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('API: /api/notes - Token received, length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('API: /api/notes - Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('API: /api/notes - Authenticated user:', user.id, user.email);

    // First, ensure user has a profile
    console.log('API: /api/notes - Checking profile for user:', user.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('API: /api/notes - Profile check result:', { profile: !!profile, profileError });

    if (!profile) {
      // Profile doesn't exist, create it
      console.log('API: /api/notes - Profile not found, creating one...');
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
          is_premium: false,
          is_admin: false
        });

      if (createProfileError) {
        console.error('API: /api/notes - Error creating profile:', createProfileError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      console.log('API: /api/notes - Profile created successfully');
    } else if (profileError) {
      console.error('API: /api/notes - Error checking profile:', profileError);
      return NextResponse.json({ error: 'Failed to check profile' }, { status: 500 });
    }

    const body = await request.json();
    console.log('API: /api/notes - Request body:', body);
    const { title, content, subject, customSubject, tags } = body;

    if (!title || !content) {
      console.log('API: /api/notes - Missing title or content');
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let subjectId = null;

    // Handle subject logic
    console.log('API: /api/notes - Processing subject:', subject, 'customSubject:', customSubject);
    
    if (subject === 'Other' && customSubject) {
      // Create new subject
      console.log('API: /api/notes - Creating new subject:', customSubject);
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({ name: customSubject })
        .select()
        .single();

      if (subjectError) {
        console.error('API: /api/notes - Error creating subject:', subjectError);
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
      }
      subjectId = newSubject.id;
      console.log('API: /api/notes - New subject created with ID:', subjectId);
    } else if (subject !== 'General') {
      // Find existing subject
      console.log('API: /api/notes - Finding existing subject:', subject);
      const { data: existingSubject, error: findError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subject)
        .single();

      if (findError || !existingSubject) {
        console.error('API: /api/notes - Subject not found:', subject, 'error:', findError);
        return NextResponse.json({ error: 'Invalid subject selected' }, { status: 400 });
      }
      subjectId = existingSubject.id;
      console.log('API: /api/notes - Found existing subject with ID:', subjectId);
    }

    const noteData = {
      user_id: user.id,
      title,
      content,
      subject_id: subjectId,
      tags: tags || []
    };

    console.log('API: /api/notes - Attempting to insert note with data:', noteData);

    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();

    if (insertError) {
      console.error('API: /api/notes - Error creating note:', insertError);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    console.log('API: /api/notes - Note created successfully:', note);
    return NextResponse.json(note);

  } catch (error) {
    console.error('API: /api/notes - Error in POST /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 