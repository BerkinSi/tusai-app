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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get all users' quiz performance
    let query = supabase
      .from('quizzes')
      .select('user_id, score, subjects')
      .not('score', 'is', null);

    // If subject is specified, filter by subject; otherwise get all quizzes (for "Genel")
    if (subject && subject !== 'Genel') {
      query = query.contains('subjects', [subject]);
    }

    const { data: quizzes, error: quizError } = await query.order('score', { ascending: false });

    if (quizError) {
      console.error('Error fetching quiz data:', quizError);
      return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
    }

    // Calculate average scores per user
    const userScores: { [key: string]: { scores: number[] } } = {};
    
    quizzes?.forEach((quiz) => {
      if (!userScores[quiz.user_id]) {
        userScores[quiz.user_id] = { scores: [] };
      }
      userScores[quiz.user_id].scores.push(quiz.score);
    });

    // Calculate average scores and create leaderboard
    const leaderboard = Object.entries(userScores).map(([userId, data]) => ({
      user_id: userId,
      name: 'Anonim', // We'll handle names separately if needed
      avgScore: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length),
      quizCount: data.scores.length
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Find current user's rank
    const userRank = leaderboard.findIndex(entry => entry.user_id === user.id) + 1;
    const totalUsers = leaderboard.length;

    // Get top performers for preview
    const topPerformers = leaderboard.slice(0, limit);

    // Generate insight based on whether it's general or subject-specific
    const displaySubject = subject === 'Genel' ? 'Genel' : subject;
    const insight = userRank > 0 
      ? subject === 'Genel'
        ? `Genel sıralamada ${totalUsers} kullanıcı arasında ${userRank}. sıradasın!`
        : `${displaySubject}'de ${totalUsers} kullanıcı arasında ${userRank}. sıradasın!`
      : subject === 'Genel'
        ? 'Henüz quiz çözülmemiş.'
        : `${displaySubject} konusunda henüz quiz çözülmemiş.`;

    return NextResponse.json({
      subject: displaySubject,
      totalUsers,
      userRank: userRank > 0 ? userRank : null,
      userScore: leaderboard.find(entry => entry.user_id === user.id)?.avgScore || null,
      topPerformers,
      insight
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 