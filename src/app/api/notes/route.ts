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
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Authenticated user:', user.id);

    // First, ensure user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Profile not found, creating one...');
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          is_premium: false
        });

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      console.log('Profile created successfully');
    }

    const body = await request.json();
    const { title, content, subject, customSubject, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let subjectId = null;

    // Handle subject logic
    if (subject === 'Other' && customSubject) {
      // Create new subject
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({ name: customSubject })
        .select()
        .single();

      if (subjectError) {
        console.error('Error creating subject:', subjectError);
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
      }
      subjectId = newSubject.id;
    } else if (subject !== 'General') {
      // Find existing subject
      const { data: existingSubject, error: findError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subject)
        .single();

      if (findError || !existingSubject) {
        console.error('Subject not found:', subject);
        return NextResponse.json({ error: 'Invalid subject selected' }, { status: 400 });
      }
      subjectId = existingSubject.id;
    }

    const noteData = {
      user_id: user.id,
      title,
      content,
      subject_id: subjectId,
      tags: tags || []
    };

    console.log('Attempting to insert note with data:', noteData);

    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating note:', insertError);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json(note);

  } catch (error) {
    console.error('Error in POST /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 