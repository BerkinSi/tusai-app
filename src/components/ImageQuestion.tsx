"use client";

import { useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ImageQuestionProps {
  questionText: string;
  imageUrl: string;
  imageAltText: string;
  options: string[];
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  isSubmitted: boolean;
  correctAnswer: number;
  explanation?: string;
}

export default function ImageQuestion({
  questionText,
  imageUrl,
  imageAltText,
  options,
  selectedAnswer,
  onAnswerSelect,
  isSubmitted,
  correctAnswer,
  explanation
}: ImageQuestionProps) {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const getAnswerStyle = (index: number) => {
    if (!isSubmitted) {
      return selectedAnswer === index 
        ? "border-tusai bg-tusai-light/60" 
        : "border-gray-200";
    }
    
    if (index === correctAnswer) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    
    if (selectedAnswer === index && selectedAnswer !== correctAnswer) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }
    
    return "border-gray-200";
  };

  return (
    <div className="mb-8">
      {/* Question Text */}
      <div className="font-semibold mb-4 text-lg">{questionText}</div>
      
      {/* Image Section */}
      <div className="mb-6">
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {/* Image with zoom functionality */}
          <div className={`relative ${isImageZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
            <Image
              src={imageUrl}
              alt={imageAltText}
              width={800}
              height={600}
              className={`w-full h-auto transition-transform duration-300 ${
                isImageZoomed ? 'scale-150' : 'scale-100'
              }`}
              onClick={() => setIsImageZoomed(!isImageZoomed)}
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                e.currentTarget.src = '/placeholder-image.png';
              }}
            />
            
            {/* Zoom indicator */}
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {isImageZoomed ? 'Click to zoom out' : 'Click to zoom in'}
            </div>
            
            {/* Full screen button */}
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded hover:bg-black/70 transition-colors"
              title="View full screen"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Image accessibility info */}
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium">Image Description:</p>
          <p>{imageAltText}</p>
        </div>
      </div>

      {/* Answer Options */}
      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer border transition-all ${
              getAnswerStyle(index)
            } ${!isSubmitted ? 'hover:border-tusai hover:bg-tusai-light/20' : ''}`}
          >
            <input
              type="radio"
              name="question-answer"
              checked={selectedAnswer === index}
              onChange={() => onAnswerSelect(index)}
              disabled={isSubmitted}
              className="w-4 h-4 text-tusai focus:ring-tusai"
            />
            <span className="flex-1">{option}</span>
            
            {/* Answer indicator */}
            {isSubmitted && (
              <div className="ml-2">
                {index === correctAnswer && (
                  <span className="text-green-600 font-semibold">✓</span>
                )}
                {selectedAnswer === index && selectedAnswer !== correctAnswer && (
                  <span className="text-red-600 font-semibold">✗</span>
                )}
              </div>
            )}
          </label>
        ))}
      </div>

      {/* Explanation */}
      {isSubmitted && explanation && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Explanation:
          </h4>
          <p className="text-blue-700 dark:text-blue-300">{explanation}</p>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            <Image
              src={imageUrl}
              alt={imageAltText}
              width={1200}
              height={900}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
} 