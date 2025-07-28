"use client";

import { useState, useRef } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import { QuestionConverter, QuestionData, QuestionImportResult } from '@/lib/questionConverter';
import { adminSupabase } from '@/lib/adminSupabaseClient';

export default function QuestionManager() {
  const { adminUser } = useAdminAuth();
  const [importResult, setImportResult] = useState<QuestionImportResult | null>(null);
  const [exportData, setExportData] = useState<QuestionData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    { id: 1, name: 'Anatomi' },
    { id: 2, name: 'Histoloji ve Embriyoloji' },
    { id: 3, name: 'Fizyoloji' },
    { id: 4, name: 'Biyokimya' },
    { id: 5, name: 'Mikrobiyoloji' },
    { id: 6, name: 'Patoloji' },
    { id: 7, name: 'Farmakoloji' },
    { id: 8, name: 'Tıbbi Biyoloji ve Genetik' },
    { id: 9, name: 'Dahiliye' },
    { id: 10, name: 'Pediatri' },
    { id: 11, name: 'Genel Cerrahi' },
    { id: 12, name: 'Kadın Hastalıkları ve Doğum' },
    { id: 13, name: 'Psikiyatri' },
    { id: 14, name: 'Nöroloji' },
    { id: 15, name: 'Anesteziyoloji ve Reanimasyon' },
    { id: 16, name: 'Radyoloji' },
    { id: 17, name: 'Halk Sağlığı' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !adminUser) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const questionsData: QuestionData[] = JSON.parse(text);

      // Validate questions
      const validationErrors: string[] = [];
      questionsData.forEach((question, index) => {
        const validation = QuestionConverter.validateQuestionFormat(question);
        if (!validation.valid) {
          validationErrors.push(`Question ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        setImportResult({
          success: false,
          imported: 0,
          failed: questionsData.length,
          errors: validationErrors
        });
        return;
      }

      // Import questions
      const result = await QuestionConverter.importQuestionsFromJSON(questionsData, adminUser.id);
      setImportResult(result);

    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: [`File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    if (!adminUser) return;

    setIsExporting(true);
    try {
      const questions = await QuestionConverter.exportQuestionsToJSON(selectedSubject);
      setExportData(questions);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions_${selectedSubject || 'all'}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleJSON = () => {
    const sampleData = QuestionConverter.generateSampleJSON();
    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_questions.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = async () => {
    try {
      const csvData = await QuestionConverter.exportQuestionsToCSV(selectedSubject);
      const dataBlob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `questions_${selectedSubject || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSV export failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Question Manager</h1>

      {/* Import Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Import Questions</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload JSON File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-tusai file:text-white hover:file:bg-tusai-dark"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-tusai text-white px-4 py-2 rounded hover:bg-tusai-dark disabled:opacity-50"
            >
              {isImporting ? 'Importing...' : 'Select File'}
            </button>

            <button
              onClick={downloadSampleJSON}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Download Sample JSON
            </button>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className={`p-4 rounded-lg ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className="font-semibold mb-2">
                Import Results: {importResult.success ? 'Success' : 'Failed'}
              </h3>
              <p>Imported: {importResult.imported}</p>
              <p>Failed: {importResult.failed}</p>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium">Errors:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Export Questions</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Subject</label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export Questions'}
            </button>

            {exportData.length > 0 && (
              <>
                <button
                  onClick={downloadJSON}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download JSON
                </button>

                <button
                  onClick={downloadCSV}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Download CSV
                </button>
              </>
            )}
          </div>

          {exportData.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Export Preview</h3>
              <p>Total questions: {exportData.length}</p>
              <p>Subject: {selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name : 'All'}</p>
            </div>
          )}
        </div>
      </div>

      {/* JSON Format Guide */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">JSON Format Guide</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Required Fields:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>subject_id</code>: Subject ID (1-17)</li>
              <li><code>question_text</code>: Question text</li>
              <li><code>options</code>: Array of answer options</li>
              <li><code>correct_answer</code>: Index of correct answer (0-based)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Optional Fields:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>explanation</code>: Explanation for correct answer</li>
              <li><code>difficulty</code>: 'easy', 'medium', or 'hard'</li>
              <li><code>image_url</code>: URL to question image</li>
              <li><code>image_alt_text</code>: Accessibility description</li>
              <li><code>source</code>: 'osym', 'ai_generated', 'user_upload', or 'manual'</li>
              <li><code>source_year</code>: Year of original exam</li>
              <li><code>tags</code>: Array of tags for categorization</li>
            </ul>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-medium mb-2">Example JSON:</h3>
            <pre className="text-sm overflow-x-auto">
{`[
  {
    "subject_id": 1,
    "question_text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Explanation here",
    "difficulty": "medium",
    "source": "osym",
    "source_year": 2021,
    "tags": ["anatomi", "knee"]
  }
]`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 