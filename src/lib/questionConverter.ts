import { supabase } from './supabaseClient';

export interface QuestionData {
  id?: string;
  subject_id: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  image_url?: string;
  image_alt_text?: string;
  source?: 'osym' | 'ai_generated' | 'user_upload' | 'manual';
  source_year?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface QuestionImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export class QuestionConverter {
  /**
   * Convert questions to JSON format for export
   */
  static async exportQuestionsToJSON(
    subjectId?: number,
    format: 'full' | 'minimal' = 'full'
  ): Promise<QuestionData[]> {
    try {
      let query = supabase
        .from('questions')
        .select(`
          id,
          subject_id,
          question_text,
          options,
          correct_answer,
          explanation,
          difficulty,
          image_url,
          image_alt_text,
          source,
          source_year,
          tags,
          created_at,
          updated_at
        `);

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data: questions, error } = await query;

      if (error) throw error;

      if (format === 'minimal') {
        return questions.map(q => ({
          subject_id: q.subject_id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }));
      }

      return questions;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export questions');
    }
  }

  /**
   * Import questions from JSON format
   */
  static async importQuestionsFromJSON(
    questionsData: QuestionData[],
    userId: string
  ): Promise<QuestionImportResult> {
    const result: QuestionImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < questionsData.length; i++) {
      try {
        const question = questionsData[i];
        
        // Validate required fields
        if (!question.question_text || !question.options || question.correct_answer === undefined) {
          result.errors.push(`Question ${i + 1}: Missing required fields`);
          result.failed++;
          continue;
        }

        // Validate options array
        if (!Array.isArray(question.options) || question.options.length === 0) {
          result.errors.push(`Question ${i + 1}: Invalid options array`);
          result.failed++;
          continue;
        }

        // Validate correct answer index
        if (question.correct_answer < 0 || question.correct_answer >= question.options.length) {
          result.errors.push(`Question ${i + 1}: Invalid correct answer index`);
          result.failed++;
          continue;
        }

        // Insert question
        const { error } = await supabase
          .from('questions')
          .insert({
            user_id: userId,
            subject_id: question.subject_id,
            question_text: question.question_text,
            options: question.options,
            correct_answer: question.correct_answer,
            explanation: question.explanation,
            difficulty: question.difficulty || 'medium',
            image_url: question.image_url,
            image_alt_text: question.image_alt_text,
            source: question.source || 'manual',
            source_year: question.source_year,
            tags: question.tags || []
          });

        if (error) {
          result.errors.push(`Question ${i + 1}: ${error.message}`);
          result.failed++;
        } else {
          result.imported++;
        }

      } catch (error) {
        result.errors.push(`Question ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.failed++;
      }
    }

    result.success = result.failed === 0;
    return result;
  }

  /**
   * Convert ÖSYM PDF questions to JSON format
   */
  static convertOSYMQuestionsToJSON(
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
      imageUrl?: string;
      subject?: string;
      year?: number;
    }>
  ): QuestionData[] {
    const subjectMap: { [key: string]: number } = {
      'Anatomi': 1,
      'Histoloji ve Embriyoloji': 2,
      'Fizyoloji': 3,
      'Biyokimya': 4,
      'Mikrobiyoloji': 5,
      'Patoloji': 6,
      'Farmakoloji': 7,
      'Tıbbi Biyoloji ve Genetik': 8,
      'Dahiliye': 9,
      'Pediatri': 10,
      'Genel Cerrahi': 11,
      'Kadın Hastalıkları ve Doğum': 12,
      'Psikiyatri': 13,
      'Nöroloji': 14,
      'Anesteziyoloji ve Reanimasyon': 15,
      'Radyoloji': 16,
      'Halk Sağlığı': 17
    };

    return questions.map(q => ({
      subject_id: subjectMap[q.subject || 'Anatomi'] || 1,
      question_text: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      image_url: q.imageUrl,
      source: 'osym',
      source_year: q.year,
      tags: q.subject ? [q.subject.toLowerCase()] : [],
      difficulty: 'medium'
    }));
  }

  /**
   * Generate sample JSON structure for questions
   */
  static generateSampleJSON(): QuestionData[] {
    return [
      {
        subject_id: 1, // Anatomi
        question_text: "Trafik kazası sonucu orbitanın medial duvarında kırık tespit edilen bir hastada, kırık hattının aşağıdaki kemik yapıların hangisinden geçmesi en az olasıdır?",
        options: [
          "Crista lacrimalis anterior",
          "Lamina perpendicularis (os ethmoidale)",
          "Corpus ossis sphenoidalis",
          "Os lacrimale",
          "Os zygomaticum"
        ],
        correct_answer: 4,
        explanation: "Orbita medial duvarı kırıklarında en sık etkilenen yapı lamina perpendicularis'tir. Os zygomaticum lateral duvarın bir parçasıdır ve medial duvar kırıklarında etkilenmesi en az olasıdır.",
        difficulty: "medium",
        source: "osym",
        source_year: 2021,
        tags: ["anatomi", "orbita", "kırık"]
      },
      {
        subject_id: 1, // Anatomi
        question_text: "Yukarıda verilen MR görüntüsünde ok ile işaretli anatomik yapı aşağıdakilerden hangisidir?",
        options: [
          "Ligamentum cruciatum anterius",
          "Meniscus medialis",
          "Ligamentum collaterale mediale",
          "Tendon patellaris",
          "Ligamentum cruciatum posterius"
        ],
        correct_answer: 0,
        explanation: "MR görüntüsünde ok ile işaretli yapı anterior cruciate ligament (ACL) olup, Ligamentum cruciatum anterius olarak adlandırılır.",
        difficulty: "medium",
        image_url: "https://example.com/knee-mri.jpg",
        image_alt_text: "MR görüntüsünde diz eklemi, ok ile işaretli anterior cruciate ligament",
        source: "osym",
        source_year: 2021,
        tags: ["anatomi", "diz", "ligament"]
      }
    ];
  }

  /**
   * Validate JSON question format
   */
  static validateQuestionFormat(question: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!question.question_text) {
      errors.push("Missing question_text");
    }

    if (!Array.isArray(question.options) || question.options.length === 0) {
      errors.push("Invalid or missing options array");
    }

    if (typeof question.correct_answer !== 'number' || question.correct_answer < 0) {
      errors.push("Invalid correct_answer");
    }

    if (question.correct_answer >= (question.options?.length || 0)) {
      errors.push("correct_answer index out of bounds");
    }

    if (!question.subject_id || typeof question.subject_id !== 'number') {
      errors.push("Missing or invalid subject_id");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export questions to CSV format
   */
  static async exportQuestionsToCSV(subjectId?: number): Promise<string> {
    const questions = await this.exportQuestionsToJSON(subjectId, 'minimal');
    
    const headers = ['Subject ID', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Option E', 'Correct Answer', 'Explanation'];
    const csvRows = [headers.join(',')];

    for (const question of questions) {
      const row = [
        question.subject_id,
        `"${question.question_text.replace(/"/g, '""')}"`,
        ...question.options.map(opt => `"${opt.replace(/"/g, '""')}"`),
        question.correct_answer,
        question.explanation ? `"${question.explanation.replace(/"/g, '""')}"` : ''
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
} 