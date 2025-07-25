"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { notesApi, subjectsApi, Note, Subject } from '../../lib/api';
import { useDataFetching } from '../../lib/useDataFetching';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import BackButton from '../../components/BackButton';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';
import Link from 'next/link';

export default function NotesPage() {
  const { authState } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: 'General',
    customSubject: '',
    tags: [] as string[]
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [notesTab, setNotesTab] = useState<'note' | 'ai'>('note');

  // Memoize fetch functions to prevent infinite loops
  const fetchNotes = useCallback(async () => {
    const response = await notesApi.getNotes();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }, []);

  const fetchSubjects = useCallback(async () => {
    const response = await subjectsApi.getSubjects();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }, []);

  // Use the new data fetching hook for notes
  const {
    data: notes,
    loading: loadingNotes,
    error: notesError,
    refetch: refetchNotes
  } = useDataFetching({
    fetchFn: fetchNotes,
    enabled: authState === 'authenticated'
  });

  // Use the new data fetching hook for subjects
  const {
    data: subjects,
    loading: loadingSubjects
  } = useDataFetching({
    fetchFn: fetchSubjects,
    enabled: authState === 'authenticated'
  });

  // Ensure we always have arrays and add debugging
  console.log('Notes data:', notes, 'Type:', typeof notes, 'Is Array:', Array.isArray(notes));
  console.log('Subjects data:', subjects, 'Type:', typeof subjects, 'Is Array:', Array.isArray(subjects));
  
  const notesArray = Array.isArray(notes) ? notes : [];
  const subjectsArray = Array.isArray(subjects) ? subjects : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted!');
    console.log('Form data:', formData);
    console.log('Editing note:', editingNote);
    
    if (!formData.title || !formData.content) {
      console.log('Validation failed: missing title or content');
      setToast({ message: 'Başlık ve içerik gereklidir', type: 'error' });
      return;
    }

    try {
      if (editingNote) {
        console.log('Updating existing note');
        const response = await notesApi.updateNote(editingNote.id, {
          title: formData.title,
          content: formData.content,
          subject: formData.subject,
          customSubject: formData.customSubject,
          tags: formData.tags
        });
        
        if (response.error) {
          throw new Error(response.error);
        }

        setToast({ message: 'Not başarıyla güncellendi!', type: 'success' });
      } else {
        console.log('Creating new note');
        const response = await notesApi.createNote({
          title: formData.title,
          content: formData.content,
          subject: formData.subject,
          customSubject: formData.customSubject,
          tags: formData.tags
        });
        
        if (response.error) {
          throw new Error(response.error);
        }

        setToast({ message: 'Not başarıyla oluşturuldu!', type: 'success' });
      }

      // Reset form and refresh notes
          handleCloseForm();
      refetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Not kaydedilirken bir hata oluştu', 
        type: 'error' 
      });
    }
  };

  const handleDelete = async (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    
    try {
      const response = await notesApi.deleteNote(noteToDelete);
      if (response.error) {
        throw new Error(response.error);
      }

      setToast({ message: 'Not başarıyla silindi!', type: 'success' });
      refetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Not silinirken bir hata oluştu', 
        type: 'error' 
      });
    } finally {
      setShowDeleteConfirmation(false);
      setNoteToDelete(null);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      subject: note.subjects?.name || 'General',
      customSubject: note.customSubject || '',
      tags: note.tags || []
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      subject: 'General',
      customSubject: '',
      tags: []
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Show loading state only when we're actually loading and authenticated
  if (authState === 'loading' || (authState === 'authenticated' && loadingNotes)) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show unauthenticated state
  if (authState === 'unauthenticated') {
    return <div className="p-8 text-center">Giriş yapmalısınız.</div>;
  }

  // Show error state
  if (authState === 'error') {
    return <div className="p-8 text-center text-red-600">Kimlik doğrulama hatası oluştu.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BackButton 
            iconOnly 
            iconClassName="w-6 h-6" 
            iconColorClass="text-black" 
            className="p-0 bg-transparent hover:bg-tusai-blue/10" 
            label="Geri Dön"
            onClick={showForm ? handleCloseForm : undefined}
          />
          <h1 className="text-2xl font-bold text-tusai">Notlarım</h1>
        </div>
        
        {!showForm && (
        <button
          onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-tusai-blue text-white px-4 py-2 rounded-lg hover:bg-tusai-blue/90 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Yeni Not
        </button>
        )}
                </div>
                
      {notesError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {notesError}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
                  {editingNote ? 'Notu Düzenle' : 'Yeni Not'}
                </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tusai-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    İçerik *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tusai-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konu
                  </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value, customSubject: e.target.value === 'Other' ? formData.customSubject : '' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tusai-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="General">Genel</option>
                {subjectsArray?.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
                <option value="Other">Diğer</option>
              </select>
              {formData.subject === 'Other' && (
                  <input
                    type="text"
                  value={formData.customSubject}
                  onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tusai-blue focus:border-transparent dark:bg-gray-700 dark:text-white mt-2"
                  placeholder="Konu adını yazın..."
                  />
              )}
                </div>

                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiketler
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tusai-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Etiket eklemek için yazın ve Enter'a basın"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                          >
                        <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

            <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                className="flex-1 bg-tusai-blue text-white px-4 py-2 rounded-lg hover:bg-tusai-blue/90 transition-colors"
                  >
                    {editingNote ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
      )}

      {/* Tabbed Interface */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setNotesTab('note')}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              notesTab === 'note'
                ? 'border-tusai-blue text-tusai-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Notlarım
          </button>
          <button
            onClick={() => setNotesTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              notesTab === 'ai'
                ? 'border-tusai-blue text-tusai-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12H1v6a2 2 0 002 2h14a2 2 0 002-2v-6h-8v2H9v-2zm0-1V8a4 4 0 118 0v3h8v2a2 2 0 01-2 2H3a2 2 0 01-2-2v-2h8z" />
            </svg>
            AI Açıklamaları
          </button>
        </div>
      </div>

      {/* Notes Content */}
      {notesTab === 'note' && (
        <div className="space-y-4">
          {notesArray && notesArray.length > 0 ? (
            notesArray.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                    {note.subjects?.name && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {note.subjects.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {note.content}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz not eklenmemiş</h3>
              <p className="text-gray-500 mb-4">İlk notunuzu eklemek için "Yeni Not" butonuna tıklayın.</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-tusai-blue text-white px-4 py-2 rounded-lg hover:bg-tusai-blue/90 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                İlk Notu Oluştur
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Explanations Content */}
      {notesTab === 'ai' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Açıklamaları</h3>
          <p className="text-gray-500 mb-4">Quiz çözerken AI tarafından oluşturulan açıklamalar burada görünecek.</p>
          <Link href="/ai-explanations" className="inline-flex items-center gap-2 bg-tusai-blue text-white px-4 py-2 rounded-lg hover:bg-tusai-blue/90 transition-colors">
            Tüm Açıklamaları Gör
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Notu Sil"
        message="Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
      />

      <Toast
        isOpen={!!toast}
        onClose={() => setToast(null)}
        message={toast?.message || ''}
        type={toast?.type || 'info'}
      />
    </div>
  );
} 