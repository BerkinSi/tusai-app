// API utility functions for the new database tables
import { supabase } from './supabaseClient';

// Types
export interface Note {
  id: string;
  title: string;
  content: string;
  subject?: string;
  subject_id?: string | null;
  subjects?: { name: string; };
  customSubject?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Subject {
  id: string;
  name: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// API Utilities
export const apiUtils = {
  async getAuthToken(): Promise<string | null> {
    try {
      console.log('API: getAuthToken - Starting');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('API: getAuthToken - Session error:', error);
        return null;
      }
      
      if (!session?.access_token) {
        console.log('API: getAuthToken - No session or token');
        return null;
      }
      
      console.log('API: getAuthToken - Token retrieved successfully');
      return session.access_token;
    } catch (error) {
      console.error('API: getAuthToken - Unexpected error:', error);
      return null;
    }
  },

  async apiCall<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log('API: apiCall - Starting for endpoint:', endpoint);
      
      const token = await this.getAuthToken();
      if (!token) {
        console.error('API: apiCall - No auth token available');
        return { error: 'Authentication required' };
      }

      const url = `${endpoint}`;
      console.log('API: apiCall - Making request to:', url);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log('API: apiCall - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: apiCall - HTTP error:', response.status, errorText);
        return { error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      console.log('API: apiCall - Success response:', data);
      return { data };
    } catch (error) {
      console.error('API: apiCall - Network error:', error);
      return { error: 'Network error occurred' };
    }
  }
};

// Notes API
export const notesApi = {
  async getNotes(): Promise<ApiResponse<Note[]>> {
    return apiUtils.apiCall<Note[]>('/api/notes');
  },

  async getNote(id: string): Promise<ApiResponse<Note>> {
    return apiUtils.apiCall<Note>(`/api/notes/${id}`);
  },

  async createNote(noteData: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ApiResponse<Note>> {
    console.log('API: Creating note with data:', noteData);
    return apiUtils.apiCall<Note>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  async updateNote(id: string, noteData: Partial<Note>): Promise<ApiResponse<Note>> {
    console.log('API: Updating note with data:', noteData);
    return apiUtils.apiCall<Note>(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  async deleteNote(id: string): Promise<ApiResponse<void>> {
    console.log('API: Deleting note:', id);
    return apiUtils.apiCall<void>(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  }
};

// Subjects API
export const subjectsApi = {
  async getSubjects(): Promise<ApiResponse<Subject[]>> {
    return apiUtils.apiCall<Subject[]>('/api/subjects');
  }
};

// Quizzes API
export const quizzesApi = {
  async getQuizzes(): Promise<ApiResponse<any[]>> {
    return apiUtils.apiCall<any[]>('/api/quizzes');
  },

  async getQuiz(id: string): Promise<ApiResponse<any>> {
    return apiUtils.apiCall<any>(`/api/quizzes/${id}`);
  },

  async createQuiz(quizData: any): Promise<ApiResponse<any>> {
    return apiUtils.apiCall<any>('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  async updateQuiz(id: string, quizData: any): Promise<ApiResponse<any>> {
    return apiUtils.apiCall<any>(`/api/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  },

  async deleteQuiz(id: string): Promise<ApiResponse<void>> {
    return apiUtils.apiCall<void>(`/api/quizzes/${id}`, {
      method: 'DELETE',
    });
  }
}; 