"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MLTrainingDataService, AIQuestionGenerationService } from '@/lib/mlServices';

interface TrainingStats {
  totalImages: number;
  processedImages: number;
  modelAccuracy: number;
  lastTrainingDate: string;
}

interface ModelMetrics {
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingSamples: number;
}

export default function MLDashboard() {
  const [stats, setStats] = useState<TrainingStats>({
    totalImages: 0,
    processedImages: 0,
    modelAccuracy: 0,
    lastTrainingDate: ''
  });
  
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load training statistics
      const { data: images } = await supabase
        .from('images')
        .select('*');

      const { data: trainingData } = await supabase
        .from('ml_training_data')
        .select('*');

      setStats({
        totalImages: images?.length || 0,
        processedImages: trainingData?.length || 0,
        modelAccuracy: 0.92, // Mock data
        lastTrainingDate: new Date().toISOString()
      });

      // Load model metrics
      setModelMetrics([
        {
          version: 'v1.0.0',
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.94,
          f1Score: 0.91,
          trainingSamples: 1500
        }
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const startTraining = async () => {
    setIsTraining(true);
    try {
      const mlService = new MLTrainingDataService();
      const result = await mlService.trainModel([]);
      
      // Update metrics
      setModelMetrics(prev => [...prev, {
        version: result.modelVersion,
        accuracy: result.accuracy,
        precision: 0.89,
        recall: 0.94,
        f1Score: 0.91,
        trainingSamples: stats.processedImages
      }]);
      
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const generateQuestions = async () => {
    try {
      const aiService = new AIQuestionGenerationService();
      
      // Generate questions for selected images
      for (const imageId of selectedImages) {
        const question = await aiService.generateQuestionFromImage(
          'image-url',
          1, // subject ID
          'medium'
        );
        
        // Save to database
        await supabase.from('questions').insert({
          subject_id: 1,
          question_text: question.questionText,
          options: question.options,
          correct_answer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          tags: question.tags,
          source: 'ai_generated'
        });
      }
      
      alert(`Generated ${selectedImages.length} questions successfully!`);
      
    } catch (error) {
      console.error('Question generation failed:', error);
      alert('Failed to generate questions');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">ML Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Images</h3>
          <p className="text-3xl font-bold text-tusai">{stats.totalImages}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Processed Images</h3>
          <p className="text-3xl font-bold text-green-600">{stats.processedImages}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Model Accuracy</h3>
          <p className="text-3xl font-bold text-blue-600">{(stats.modelAccuracy * 100).toFixed(1)}%</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Last Training</h3>
          <p className="text-sm text-gray-500">{new Date(stats.lastTrainingDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Model Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Model Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Version</th>
                <th className="text-left py-2">Accuracy</th>
                <th className="text-left py-2">Precision</th>
                <th className="text-left py-2">Recall</th>
                <th className="text-left py-2">F1 Score</th>
                <th className="text-left py-2">Training Samples</th>
              </tr>
            </thead>
            <tbody>
              {modelMetrics.map((model, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{model.version}</td>
                  <td className="py-2">{(model.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-2">{(model.precision * 100).toFixed(1)}%</td>
                  <td className="py-2">{(model.recall * 100).toFixed(1)}%</td>
                  <td className="py-2">{(model.f1Score * 100).toFixed(1)}%</td>
                  <td className="py-2">{model.trainingSamples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Model Training</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Train the ML model on processed images to improve question generation.
          </p>
          <button
            onClick={startTraining}
            disabled={isTraining}
            className="bg-tusai text-white px-4 py-2 rounded hover:bg-tusai-dark disabled:opacity-50"
          >
            {isTraining ? 'Training...' : 'Start Training'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Question Generation</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Generate new questions using AI from processed images.
          </p>
          <button
            onClick={generateQuestions}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Generate Questions
          </button>
        </div>
      </div>

      {/* Image Processing Pipeline */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-8">
        <h3 className="text-lg font-semibold mb-4">Image Processing Pipeline</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <h4 className="font-medium">OCR Processing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Extract text from images</p>
            </div>
            <span className="text-green-600">✓ Active</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <h4 className="font-medium">Medical Image Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Detect anatomical structures</p>
            </div>
            <span className="text-green-600">✓ Active</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <h4 className="font-medium">Watermark Detection</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Identify and process watermarks</p>
            </div>
            <span className="text-yellow-600">⚠ Pending</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <h4 className="font-medium">AI Question Generation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Generate questions from images</p>
            </div>
            <span className="text-green-600">✓ Active</span>
          </div>
        </div>
      </div>
    </div>
  );
} 