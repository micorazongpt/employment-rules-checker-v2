'use client';

import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onAnalysisComplete: (result: any) => void;
}

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // 드래그 핸들러
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // 드롭 핸들러
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // 파일 선택 핸들러
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // 파일 처리
  const handleFile = (selectedFile: File) => {
    // 파일 형식 검증
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('지원하지 않는 파일 형식입니다. TXT, PDF, DOC, DOCX 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.');
      return;
    }

    setFile(selectedFile);
  };

  // 분석 시작
  const startAnalysis = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setProgress(0);

    // 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // 실제 API 호출 대신 데모 데이터 반환
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 데모 분석 결과
      const demoResult = {
        riskLevel: Math.random() > 0.5 ? '보통' : '높음',
        summary: '취업규칙 검토가 완료되었습니다. 전반적으로 법적 요구사항을 충족하고 있으나, 일부 개선이 필요한 부분이 발견되었습니다.',
        requiredItems: [
          {
            item: '근로시간 및 휴게시간',
            status: '적정',
            description: '주 40시간 근무제 및 휴게시간이 적절히 명시되어 있습니다.',
            compliance: 95
          },
          {
            item: '연차휴가 규정',
            status: '보완필요',
            description: '연차휴가 부여 기준이 불명확합니다.',
            compliance: 75
          },
          {
            item: '임금 지급 규정',
            status: '적정',
            description: '최저임금 준수 및 임금 지급일이 명확히 규정되어 있습니다.',
            compliance: 90
          }
        ],
        riskFactors: [
          {
            factor: '징계 절차',
            level: '중간',
            description: '징계 절차에서 근로자 의견 청취 과정이 미흡합니다.',
            recommendation: '징계위원회 구성 및 의견 청취 절차를 명문화하세요.',
            legalBasis: '근로기준법 제27조'
          },
          {
            factor: '해고 사유',
            level: '높음',
            description: '정당한 해고 사유가 구체적으로 명시되지 않았습니다.',
            recommendation: '객관적이고 합리적인 해고 사유를 구체적으로 규정하세요.',
            legalBasis: '근로기준법 제23조'
          }
        ],
        recommendations: [
          {
            priority: '높음',
            item: '해고 사유 명시',
            action: '정당한 해고 사유를 구체적으로 명문화',
            deadline: '1개월 내',
            legalRisk: '부당해고 소송 위험'
          },
          {
            priority: '중간',
            item: '연차휴가 규정 보완',
            action: '연차휴가 부여 기준 및 절차 상세 기술',
            deadline: '2개월 내',
            legalRisk: '근로감독 시 지적 가능성'
          }
        ],
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        analysisDate: new Date().toLocaleDateString('ko-KR'),
        analysisTime: new Date().toLocaleTimeString('ko-KR'),
        aiMode: '스마트 분석 모드',
        note: '본 분석 결과는 AI 기반 자동 검토 결과입니다. 정확한 법적 검토를 위해서는 전문가 상담을 받으시기 바랍니다.',
        complianceScore: Math.floor(Math.random() * 20) + 75, // 75-95%
        complianceGrade: 'B+'
      };

      clearInterval(progressInterval);
      setProgress(100);
      
      // 결과 전달
      setTimeout(() => {
        onAnalysisComplete(demoResult);
        setIsAnalyzing(false);
        setProgress(0);
        setFile(null);
      }, 500);

    } catch (error) {
      console.error('Analysis error:', error);
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setProgress(0);
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 파일 제거
  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-6">
      {/* 파일 업로드 영역 */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />
        
        <div className="flex flex-col items-center space-y-6">
          {/* 아이콘 */}
          <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>

          {/* 텍스트 */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              취업규칙 파일을 업로드하세요
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              파일을 드래그하여 놓거나 클릭하여 선택하세요
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              지원 형식: TXT, PDF, DOC, DOCX (최대 10MB)
            </p>
          </div>

          {/* 업로드 버튼 */}
          <button
            type="button"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isAnalyzing}
          >
            파일 선택
          </button>
        </div>
      </div>

      {/* 선택된 파일 표시 */}
      {file && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            {!isAnalyzing && (
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>

          {/* 분석 버튼 */}
          {!isAnalyzing && (
            <div className="mt-6">
              <button
                onClick={startAnalysis}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🤖 AI 분석 시작
              </button>
            </div>
          )}
        </div>
      )}

      {/* 분석 진행 상태 */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
          <div className="text-center space-y-6">
            {/* 로딩 애니메이션 */}
            <div className="w-16 h-16 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                🤖 AI가 취업규칙을 분석하고 있습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                법적 준수 여부와 개선사항을 검토 중입니다...
              </p>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}% 완료
            </p>

            {/* 분석 단계 표시 */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className={`p-3 rounded-lg ${progress > 30 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                📖 문서 읽기
              </div>
              <div className={`p-3 rounded-lg ${progress > 60 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                ⚖️ 법령 검토
              </div>
              <div className={`p-3 rounded-lg ${progress > 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                📊 결과 생성
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}