'use client';

import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import AnalysisResults from '../components/AnalysisResults';

interface AnalysisData {
  riskLevel: string;
  summary: string;
  requiredItems?: Array<{
    item: string;
    status: string;
    description: string;
    compliance?: number;
  }>;
  riskFactors?: Array<{
    factor: string;
    level: string;
    description: string;
    recommendation: string;
    legalBasis?: string;
  }>;
  recommendations?: Array<{
    priority: string;
    item: string;
    action: string;
    deadline?: string;
    legalRisk?: string;
  }>;
  fileName: string;
  fileSize: string;
  analysisDate: string;
  analysisTime: string;
  aiMode?: string;
  note?: string;
  complianceScore?: number;
  complianceGrade?: string;
}

interface AnalysisHistory {
  id: string;
  fileName: string;
  analysisDate: string;
  riskLevel: string;
  complianceScore?: number;
  data: AnalysisData;
}

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 다크모드 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedDarkMode);
      
      // 히스토리 로드
      const savedHistory = localStorage.getItem('analysisHistory');
      if (savedHistory) {
        setAnalysisHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  // 다크모드 토글
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode));
      document.documentElement.classList.toggle('dark', newDarkMode);
    }
  };

  const handleAnalysisComplete = (result: AnalysisData) => {
    console.log('분석 결과 받음:', result);
    
    // 데이터 안전성 재검증
    const safeResult: AnalysisData = {
      riskLevel: result?.riskLevel || '보통',
      summary: result?.summary || '분석이 완료되었습니다.',
      requiredItems: Array.isArray(result?.requiredItems) ? result.requiredItems : [],
      riskFactors: Array.isArray(result?.riskFactors) ? result.riskFactors : [],
      recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
      fileName: result?.fileName || 'unknown.txt',
      fileSize: result?.fileSize || '0 KB',
      analysisDate: result?.analysisDate || new Date().toLocaleDateString('ko-KR'),
      analysisTime: result?.analysisTime || new Date().toLocaleTimeString('ko-KR'),
      aiMode: result?.aiMode || '스마트 분석 모드',
      note: result?.note || '',
      complianceScore: result?.complianceScore,
      complianceGrade: result?.complianceGrade
    };
    
    // 히스토리에 추가
    if (typeof window !== 'undefined') {
      const historyItem: AnalysisHistory = {
        id: Date.now().toString(),
        fileName: safeResult.fileName,
        analysisDate: safeResult.analysisDate,
        riskLevel: safeResult.riskLevel,
        complianceScore: safeResult.complianceScore,
        data: safeResult
      };
      
      const updatedHistory = [historyItem, ...analysisHistory.slice(0, 9)]; // 최대 10개 보관
      setAnalysisHistory(updatedHistory);
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
    }
    
    setAnalysisResult(safeResult);
  };

  const loadFromHistory = (historyItem: AnalysisHistory) => {
    setAnalysisResult(historyItem.data);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analysisHistory');
    }
    setShowHistory(false);
  };

  const shareResult = async () => {
    if (!analysisResult) return;
    
    const shareData = {
      title: '취업규칙 분석 결과',
      text: `${analysisResult.fileName} 분석 완료 - 위험도: ${analysisResult.riskLevel}`,
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      // 클립보드 복사 대체
      const shareText = `📊 취업규칙 분석 완료\n파일: ${analysisResult.fileName}\n위험도: ${analysisResult.riskLevel}\n${analysisResult.complianceScore ? `준수율: ${analysisResult.complianceScore}%` : ''}`;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        alert('분석 결과가 클립보드에 복사되었습니다!');
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* 헤더 */}
      <header className={`border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className={`text-3xl font-bold transition-colors duration-200 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                🏢 취업규칙 검토 시스템
              </h1>
              <p className={`mt-2 text-lg transition-colors duration-200 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                AI가 3분만에 취업규칙을 검토하고 법적 준수 여부를 확인해드립니다
              </p>
            </div>
            
            {/* 우측 메뉴 */}
            <div className="flex items-center space-x-4">
              {/* 히스토리 버튼 */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl transition-colors duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="분석 히스토리"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>

              {/* 공유 버튼 */}
              {analysisResult && (
                <button
                  onClick={shareResult}
                  className={`p-2 rounded-xl transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                  title="결과 공유"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                </button>
              )}

              {/* 다크모드 토글 */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-colors duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-yellow-400 hover:text-yellow-300' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title={darkMode ? '라이트 모드' : '다크 모드'}
              >
                {darkMode ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 히스토리 사이드바 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowHistory(false)}></div>
          <div className={`relative w-96 h-full overflow-y-auto transition-colors duration-200 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  분석 히스토리
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className={`p-2 rounded-lg ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {analysisHistory.length > 0 ? (
                <div className="space-y-3">
                  {analysisHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className={`p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
                        darkMode 
                          ? 'hover:bg-gray-700 border border-gray-600' 
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.fileName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.riskLevel === '높음' ? 'bg-red-100 text-red-700' :
                          item.riskLevel === '보통' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.analysisDate}
                        {item.complianceScore && ` · ${item.complianceScore}%`}
                      </p>
                    </div>
                  ))}
                  
                  <button
                    onClick={clearHistory}
                    className={`w-full mt-4 p-2 rounded-lg text-sm transition-colors duration-200 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    히스토리 전체 삭제
                  </button>
                </div>
              ) : (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  아직 분석 히스토리가 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          /* 파일 업로드 섹션 */
          <div className="space-y-8">
            <FileUpload onAnalysisComplete={handleAnalysisComplete} />
            
            {/* 기능 소개 */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className={`rounded-2xl shadow-sm border p-8 text-center hover:shadow-md transition-all duration-200 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
                  darkMode ? 'bg-blue-900' : 'bg-blue-50'
                }`}>
                  <svg className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>법적 준수 검토</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>근로기준법 및 관련 법령 준수 여부를 정밀 분석합니다</p>
              </div>
              
              <div className={`rounded-2xl shadow-sm border p-8 text-center hover:shadow-md transition-all duration-200 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
                  darkMode ? 'bg-amber-900' : 'bg-amber-50'
                }`}>
                  <svg className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>위험요소 식별</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>잠재적 법적 리스크와 개선이 필요한 부분을 찾아냅니다</p>
              </div>
              
              <div className={`rounded-2xl shadow-sm border p-8 text-center hover:shadow-md transition-all duration-200 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
                  darkMode ? 'bg-emerald-900' : 'bg-emerald-50'
                }`}>
                  <svg className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>개선방안 제시</h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>구체적이고 실행 가능한 개선 권고사항을 제공합니다</p>
              </div>
            </div>

            {/* 지원 파일 형식 */}
            <div className={`border rounded-2xl p-8 ${
              darkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-100'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>지원 파일 형식</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['TXT', 'PDF', 'DOC', 'DOCX'].map((format) => (
                  <div key={format} className={`flex items-center ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                      darkMode ? 'bg-blue-800' : 'bg-blue-100'
                    }`}>
                      <svg className={`w-5 h-5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <span className="font-medium">{format}</span>
                  </div>
                ))}
              </div>
              <p className={`text-sm mt-4 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                최대 파일 크기: 10MB
              </p>
            </div>

            {/* 사용법 안내 */}
            <div className={`border rounded-2xl p-8 shadow-sm ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>사용법</h3>
              <div className="space-y-6">
                {[
                  { step: 1, title: '취업규칙 파일 업로드', desc: '현재 사용중인 취업규칙 문서를 업로드해주세요' },
                  { step: 2, title: 'AI 분석 시작', desc: '2-3초간 AI가 법적 준수 여부를 종합 검토합니다' },
                  { step: 3, title: '결과 확인 및 다운로드', desc: '분석 결과를 확인하고 엑셀/워드 형태로 다운로드하세요' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{backgroundColor: '#3182F6'}}>
                      {item.step}
                    </div>
                    <div>
                      <p className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 분석 결과 섹션 */
          <AnalysisResults data={analysisResult} />
        )}
      </main>

      {/* 푸터 */}
      <footer className={`border-t mt-16 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>🔒 업로드된 파일은 분석 후 즉시 삭제되며, 어떠한 정보도 저장되지 않습니다.</p>
            <p className="mt-2">⚖️ 본 서비스는 참고용이며, 정확한 법적 검토를 위해서는 전문가 상담을 받으시기 바랍니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}