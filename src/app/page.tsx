// src/app/page.tsx - ChatGPT 브랜딩으로 업데이트

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Zap,
  Clock,
  Users,
  Eye,
  Moon,
  Sun,
  Loader2
} from 'lucide-react';

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
      setFile(selectedFile);
    } else {
      alert('TXT 파일만 업로드 가능합니다.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const text = await file.text();
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadResult = (format: 'excel' | 'word' | 'pdf') => {
    // 다운로드 로직
    console.log(`Downloading as ${format}`);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
    }`}>
      
      {/* 다크모드 토글 */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleDarkMode}
          className={`p-3 rounded-full transition-all duration-300 ${
            isDarkMode 
              ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
              : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          }`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* 헤더 섹션 */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className={`text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            AI 기반 취업규칙 검토 시스템
          </h1>
          <p className={`text-xl mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            최신 ChatGPT 기술로 정확하고 빠른 법적 분석을 제공합니다
          </p>
        </motion.div>

        {/* 기능 소개 카드들 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-8 rounded-2xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/80 border border-gray-200'
            } backdrop-blur-sm`}
          >
            <div className="text-blue-500 mb-4">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-4">최신 ChatGPT 분석</h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              최신 ChatGPT 기술을 근로기준법 및 관련 법령 준수 여부를 정밀 분석합니다
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-8 rounded-2xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/80 border border-gray-200'
            } backdrop-blur-sm`}
          >
            <div className="text-orange-500 mb-4">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-4">위험요소 식별</h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              잠재적 법적 리스크와 개선이 필요한 부분을 최신 ChatGPT가 찾아냅니다
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-8 rounded-2xl ${
              isDarkMode 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/80 border border-gray-200'
            } backdrop-blur-sm`}
          >
            <div className="text-green-500 mb-4">
              <Zap size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-4">개선방안 제시</h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              구체적이고 실행 가능한 개선 권고사항을 최신 ChatGPT가 제공합니다
            </p>
          </motion.div>
        </div>

        {/* 새로운 기능 배너 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className={`p-6 rounded-2xl mb-12 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-800/50 to-blue-800/50 border border-purple-700' 
              : 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2 flex items-center">
                <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm mr-3">NEW</span>
                2025년 2월 육아지원법 개정사항 반영
              </h3>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-purple-500" />
                  <span>육아휴직 확대</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-purple-500" />
                  <span>출산전후휴가 개선</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-purple-500" />
                  <span>배우자 출산휴가</span>
                </div>
              </div>
            </div>
          </div>
          <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            최신 ChatGPT로 최신 법령 개정사항을 자동으로 반영합니다
          </p>
        </motion.div>

        {/* ChatGPT 기반 정밀 분석 섹션 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className={`p-8 rounded-2xl mb-12 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-800/30 to-blue-800/30 border border-green-700' 
              : 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200'
          }`}
        >
          <div className="flex items-center mb-6">
            <div className="text-green-500 mr-4">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold">최신 ChatGPT 기반 정밀 분석</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                최신 AI 기술 활용
              </h4>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                최신 ChatGPT를 통해 업계 최고 수준의 AI 분석을 제공하며, 모든 데이터는 안전하게 처리됩니다
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                데이터 보안 보장
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                최신 ChatGPT를 통해 업계 최고 수준의 AI 분석을 제공하며, 모든 데이터는 안전하게 처리됩니다
              </p>
            </div>
          </div>
        </motion.div>

        {/* 파일 업로드 섹션 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className={`max-w-4xl mx-auto p-8 rounded-2xl ${
            isDarkMode 
              ? 'bg-gray-800/50 border-2 border-gray-700' 
              : 'bg-white/80 border-2 border-gray-200'
          } backdrop-blur-sm`}
        >
          {!file ? (
            <div
              className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : isDarkMode 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <Upload size={64} className={`mx-auto mb-4 ${
                dragOver ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className="text-2xl font-bold mb-4">취업규칙 파일 업로드</h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                TXT 파일을 드래그하거나 클릭하여 업로드하세요
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                파일 선택
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="text-center">
              <FileText size={64} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">{file.name}</h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                파일이 업로드되었습니다. 분석을 시작하세요.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    '최신 ChatGPT로 분석 시작'
                  )}
                </button>
                <button
                  onClick={() => setFile(null)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  다른 파일 선택
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* 분석 결과 섹션 */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className={`mt-12 p-8 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gray-800/50 border border-gray-700' 
                  : 'bg-white/80 border border-gray-200'
              } backdrop-blur-sm`}
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <CheckCircle className="text-green-500 mr-3" size={32} />
                최신 ChatGPT 분석 완료
              </h2>
              
              {/* 분석 요약 */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <h4 className="font-semibold text-blue-600 mb-2">총 발견 이슈</h4>
                  <p className="text-2xl font-bold">{analysisResult.summary.totalIssues}개</p>
                </div>
                <div className={`p-4 rounded-xl ${
                  analysisResult.summary.riskLevel === 'HIGH' 
                    ? isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                    : isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    analysisResult.summary.riskLevel === 'HIGH' ? 'text-red-600' : 'text-yellow-600'
                  }`}>위험도</h4>
                  <p className="text-2xl font-bold">{analysisResult.summary.riskLevel}</p>
                </div>
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                }`}>
                  <h4 className="font-semibold text-green-600 mb-2">준수율</h4>
                  <p className="text-2xl font-bold">{analysisResult.summary.complianceScore}점</p>
                </div>
              </div>

              {/* 상세 분석 내용 */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">상세 분석 결과</h3>
                <div className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                } whitespace-pre-wrap`}>
                  {analysisResult.analysis}
                </div>
              </div>

              {/* 다운로드 버튼들 */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => downloadResult('excel')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <Download size={20} />
                  Excel 다운로드
                </button>
                <button
                  onClick={() => downloadResult('word')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <Download size={20} />
                  Word 다운로드
                </button>
                <button
                  onClick={() => downloadResult('pdf')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <Download size={20} />
                  PDF 다운로드
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
