'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface AnalysisResult {
  fileName: string;
  fileSize: string;
  riskLevel: string;
  summary: string;
  complianceScore: number;
  complianceGrade: string;
  analysisDate: string;
  analysisTime: string;
  requiredItems: Array<{
    item: string;
    status: string;
    description: string;
    compliance: number;
  }>;
  riskFactors: Array<{
    factor: string;
    level: string;
    description: string;
    recommendation: string;
  }>;
  recommendations: Array<{
    priority: string;
    item: string;
    action: string;
    deadline: string;
  }>;
}

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // 다크모드 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedDarkMode);
      document.documentElement.classList.toggle('dark', savedDarkMode);
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

  // 파일 검증
  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'text/plain', 
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      return '지원하는 파일 형식: .txt, .pdf, .doc, .docx';
    }

    if (file.size > 10 * 1024 * 1024) {
      return '파일 크기는 10MB 이하여야 합니다.';
    }

    return null;
  };

  // 파일 선택 처리
  const handleFileSelect = useCallback((files: FileList) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFile(selectedFile);
    console.log('파일 선택됨:', selectedFile.name);
  }, []);

  // 드래그 앤 드롭 핸들러
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // 파일 input 변경
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  // 진행률 시뮬레이션
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  // 분석 시작 (모킹 데이터 사용)
  const startAnalysis = async () => {
    if (!file) {
      console.log('파일이 선택되지 않았습니다.');
      setError('파일을 먼저 선택해주세요.');
      return;
    }

    console.log('분석 시작:', file.name);
    setIsAnalyzing(true);
    setError(null);
    
    const progressInterval = simulateProgress();

    // 실제 API 연결 시 이 부분을 수정하세요
    // 현재는 데모용 모킹 데이터 사용
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        riskLevel: Math.random() > 0.5 ? '보통' : '낮음',
        summary: '분석이 완료되었습니다. 전반적으로 근로기준법을 준수하고 있으나 일부 개선이 필요한 항목이 발견되었습니다. AI가 파일 내용을 검토한 결과, 대부분의 필수 항목이 적절히 규정되어 있으나 세부적인 개선사항이 확인되었습니다.',
        complianceScore: Math.floor(Math.random() * 20) + 75, // 75-95% 랜덤
        complianceGrade: 'B+',
        analysisDate: new Date().toLocaleDateString('ko-KR'),
        analysisTime: new Date().toLocaleTimeString('ko-KR'),
        requiredItems: [
          {
            item: '근로시간 규정',
            status: '준수',
            description: '주 40시간 근로시간 원칙이 잘 반영되어 있습니다.',
            compliance: 95
          },
          {
            item: '휴게시간 규정',
            status: '개선필요',
            description: '휴게시간에 대한 구체적인 명시가 부족합니다.',
            compliance: 70
          },
          {
            item: '연차휴가 규정',
            status: '준수',
            description: '연차휴가 부여 기준이 법령에 맞게 규정되어 있습니다.',
            compliance: 90
          },
          {
            item: '임금 지급 규정',
            status: '준수',
            description: '임금 지급일과 지급 방법이 명확히 규정되어 있습니다.',
            compliance: 88
          },
          {
            item: '퇴직급여 규정',
            status: '개선필요',
            description: '퇴직급여 산정 기준에 대한 세부 설명이 필요합니다.',
            compliance: 65
          }
        ],
        riskFactors: [
          {
            factor: '징계 절차',
            level: '중간',
            description: '징계 절차에서 근로자의 소명 기회 보장이 미흡합니다.',
            recommendation: '징계위원회 구성 및 소명 절차를 명확히 규정하세요.'
          },
          {
            factor: '임금 지급 기준',
            level: '낮음',
            description: '임금 지급일 및 방법이 명확히 규정되어 있습니다.',
            recommendation: '현재 수준을 유지하시면 됩니다.'
          },
          {
            factor: '휴게시간 운영',
            level: '중간',
            description: '휴게시간 부여 기준이 모호하게 표현되어 있습니다.',
            recommendation: '근로시간별 휴게시간을 명확한 수치로 규정하세요.'
          }
        ],
        recommendations: [
          {
            priority: '높음',
            item: '휴게시간 명시',
            action: '4시간 근로 시 30분, 8시간 근로 시 1시간 휴게시간을 명확히 규정',
            deadline: '1개월 이내'
          },
          {
            priority: '중간',
            item: '징계절차 개선',
            action: '징계위원회 구성 및 운영 규정 추가',
            deadline: '3개월 이내'
          },
          {
            priority: '중간',
            item: '퇴직급여 산정기준 보완',
            action: '퇴직급여 산정 방법과 지급 절차를 상세히 기술',
            deadline: '2개월 이내'
          },
          {
            priority: '낮음',
            item: '복리후생 규정 추가',
            action: '법정 외 복리후생 제도에 대한 내용 보완',
            deadline: '6개월 이내'
          }
        ]
      };

      setAnalysisResult(mockResult);
      clearInterval(progressInterval);
      setProgress(100);
      setIsAnalyzing(false);
      
      console.log('분석 완료:', mockResult);
    }, 3000);
  };

  // 새 분석 시작
  const startNewAnalysis = () => {
    setAnalysisResult(null);
    setFile(null);
    setError(null);
    setProgress(0);
  };

  // 파일 제거
  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  // 구글시트 클립보드 복사 함수
  const downloadGoogleSheets = async (data: AnalysisResult) => {
    // 구글시트용 TSV (탭으로 구분된 값) 형식 생성
    let tsvContent = '취업규칙 AI 분석 결과\t\t\t\n\n';
    
    // 기본 정보
    tsvContent += '구분\t항목\t값\t설명\n';
    tsvContent += `기본정보\t파일명\t${data.fileName}\t\n`;
    tsvContent += `기본정보\t파일크기\t${data.fileSize}\t\n`;
    tsvContent += `기본정보\t분석일시\t${data.analysisDate} ${data.analysisTime}\t\n`;
    tsvContent += `기본정보\t위험수준\t${data.riskLevel}\t\n`;
    tsvContent += `기본정보\t준수율\t${data.complianceScore}%\t\n`;
    tsvContent += `기본정보\t등급\t${data.complianceGrade}\t\n\n`;
    
    // 분석 요약
    tsvContent += '분석 요약\t\t\t\n';
    tsvContent += `요약\t내용\t${data.summary}\t\n\n`;
    
    // 필수 항목 검토
    tsvContent += '필수 항목 검토\t\t\t\n';
    tsvContent += '항목\t상태\t설명\t준수율\n';
    data.requiredItems.forEach(item => {
      tsvContent += `${item.item}\t${item.status}\t${item.description}\t${item.compliance}%\n`;
    });
    tsvContent += '\n';
    
    // 위험 요소
    tsvContent += '위험 요소\t\t\t\n';
    tsvContent += '요소\t위험수준\t설명\t권고사항\n';
    data.riskFactors.forEach(risk => {
      tsvContent += `${risk.factor}\t${risk.level}\t${risk.description}\t${risk.recommendation}\n`;
    });
    tsvContent += '\n';
    
    // 개선 권고사항
    tsvContent += '개선 권고사항\t\t\t\n';
    tsvContent += '항목\t우선순위\t조치사항\t완료목표\n';
    data.recommendations.forEach(rec => {
      tsvContent += `${rec.item}\t${rec.priority}\t${rec.action}\t${rec.deadline}\n`;
    });
    
    try {
      // 클립보드에 복사
      await navigator.clipboard.writeText(tsvContent);
      
      // 사용자에게 성공 알림 및 구글시트 이동 안내
      if (confirm('✅ 데이터가 클립보드에 복사되었습니다!\n\n구글시트에서 사용하려면:\n1. 구글 시트로 이동\n2. A1 셀 선택\n3. Ctrl+V (또는 Cmd+V)로 붙여넣기\n\n지금 구글시트로 이동하시겠습니까?')) {
        window.open('https://sheets.google.com', '_blank');
      }
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      
      // 클립보드 복사 실패 시 파일 다운로드로 대체
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `취업규칙_분석결과_GoogleSheets_${new Date().getTime()}.tsv`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('클립보드 복사에 실패하여 파일로 다운로드됩니다.\n다운로드된 파일을 구글시트에서 가져오기해주세요.');
    }
  };

  // 엑셀 다운로드 함수
  const downloadExcel = (data: AnalysisResult) => {
    // CSV 형식으로 데이터 생성
    let csvContent = '\uFEFF'; // UTF-8 BOM for Korean support
    
    // 기본 정보
    csvContent += '취업규칙 AI 분석 결과\n\n';
    csvContent += `파일명,${data.fileName}\n`;
    csvContent += `파일크기,${data.fileSize}\n`;
    csvContent += `분석일시,${data.analysisDate} ${data.analysisTime}\n`;
    csvContent += `위험수준,${data.riskLevel}\n`;
    csvContent += `준수율,${data.complianceScore}%\n`;
    csvContent += `등급,${data.complianceGrade}\n\n`;
    
    // 분석 요약
    csvContent += '분석 요약\n';
    csvContent += `"${data.summary}"\n\n`;
    
    // 필수 항목 검토
    csvContent += '필수 항목 검토\n';
    csvContent += '항목,상태,설명,준수율\n';
    data.requiredItems.forEach(item => {
      csvContent += `"${item.item}","${item.status}","${item.description}",${item.compliance}%\n`;
    });
    csvContent += '\n';
    
    // 위험 요소
    csvContent += '위험 요소\n';
    csvContent += '요소,위험수준,설명,권고사항\n';
    data.riskFactors.forEach(risk => {
      csvContent += `"${risk.factor}","${risk.level}","${risk.description}","${risk.recommendation}"\n`;
    });
    csvContent += '\n';
    
    // 개선 권고사항
    csvContent += '개선 권고사항\n';
    csvContent += '항목,우선순위,조치사항,완료목표\n';
    data.recommendations.forEach(rec => {
      csvContent += `"${rec.item}","${rec.priority}","${rec.action}","${rec.deadline}"\n`;
    });
    
    // 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `취업규칙_분석결과_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 워드 다운로드 함수 (HTML 형식)
  const downloadWord = (data: AnalysisResult) => {
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>취업규칙 AI 분석 결과</title>
    <style>
        body { font-family: '맑은 고딕', Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3182F6; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #3182F6; margin-bottom: 10px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table th, .info-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .info-table th { background-color: #f8f9fa; font-weight: bold; width: 30%; }
        .section { margin: 30px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 15px; border-left: 4px solid #3182F6; padding-left: 10px; }
        .summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .item-table th, .item-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .item-table th { background-color: #3182F6; color: white; font-weight: bold; }
        .status-pass { color: #059669; font-weight: bold; }
        .status-improve { color: #d97706; font-weight: bold; }
        .risk-high { color: #dc2626; font-weight: bold; }
        .risk-medium { color: #d97706; font-weight: bold; }
        .risk-low { color: #059669; font-weight: bold; }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #d97706; font-weight: bold; }
        .priority-low { color: #059669; font-weight: bold; }
        .score-box { background: linear-gradient(135deg, #3182F6, #8B5CF6); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .score-number { font-size: 36px; font-weight: bold; }
        .score-grade { font-size: 24px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🏢 취업규칙 AI 분석 결과</div>
        <p>AI가 분석한 법적 준수 여부 및 개선 권고사항</p>
    </div>

    <div class="section">
        <div class="section-title">📋 기본 정보</div>
        <table class="info-table">
            <tr><th>파일명</th><td>${data.fileName}</td></tr>
            <tr><th>파일크기</th><td>${data.fileSize}</td></tr>
            <tr><th>분석일시</th><td>${data.analysisDate} ${data.analysisTime}</td></tr>
            <tr><th>위험수준</th><td>${data.riskLevel}</td></tr>
        </table>
    </div>

    <div class="score-box">
        <div>법적 준수율</div>
        <div class="score-number">${data.complianceScore}%</div>
        <div class="score-grade">등급: ${data.complianceGrade}</div>
    </div>

    <div class="section">
        <div class="section-title">📄 분석 요약</div>
        <div class="summary">${data.summary}</div>
    </div>

    <div class="section">
        <div class="section-title">📝 필수 항목 검토</div>
        <table class="item-table">
            <thead>
                <tr>
                    <th>항목</th>
                    <th>상태</th>
                    <th>설명</th>
                    <th>준수율</th>
                </tr>
            </thead>
            <tbody>
                ${data.requiredItems.map(item => `
                <tr>
                    <td>${item.item}</td>
                    <td class="${item.status === '준수' ? 'status-pass' : 'status-improve'}">${item.status}</td>
                    <td>${item.description}</td>
                    <td>${item.compliance}%</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">⚠️ 위험 요소</div>
        <table class="item-table">
            <thead>
                <tr>
                    <th>요소</th>
                    <th>위험수준</th>
                    <th>설명</th>
                    <th>권고사항</th>
                </tr>
            </thead>
            <tbody>
                ${data.riskFactors.map(risk => `
                <tr>
                    <td>${risk.factor}</td>
                    <td class="risk-${risk.level === '높음' ? 'high' : risk.level === '중간' ? 'medium' : 'low'}">${risk.level}</td>
                    <td>${risk.description}</td>
                    <td>${risk.recommendation}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">💡 개선 권고사항</div>
        <table class="item-table">
            <thead>
                <tr>
                    <th>항목</th>
                    <th>우선순위</th>
                    <th>조치사항</th>
                    <th>완료목표</th>
                </tr>
            </thead>
            <tbody>
                ${data.recommendations.map(rec => `
                <tr>
                    <td>${rec.item}</td>
                    <td class="priority-${rec.priority === '높음' ? 'high' : rec.priority === '중간' ? 'medium' : 'low'}">${rec.priority}</td>
                    <td>${rec.action}</td>
                    <td>${rec.deadline}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>본 분석 결과는 AI에 의해 생성되었으며, 참고용으로만 사용하시기 바랍니다.</p>
        <p>정확한 법적 검토를 위해서는 전문가 상담을 받으시기 바랍니다.</p>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `취업규칙_분석결과_${new Date().getTime()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV 다운로드 함수
  const downloadCSV = (data: AnalysisResult) => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    
    // 간단한 CSV 형식
    csvContent += '구분,항목,값\n';
    csvContent += `기본정보,파일명,${data.fileName}\n`;
    csvContent += `기본정보,준수율,${data.complianceScore}%\n`;
    csvContent += `기본정보,등급,${data.complianceGrade}\n`;
    csvContent += `기본정보,위험수준,${data.riskLevel}\n\n`;
    
    data.requiredItems.forEach(item => {
      csvContent += `필수항목,"${item.item}","${item.status} (${item.compliance}%)"\n`;
    });
    
    csvContent += '\n';
    data.riskFactors.forEach(risk => {
      csvContent += `위험요소,"${risk.factor}","${risk.level} - ${risk.recommendation}"\n`;
    });
    
    csvContent += '\n';
    data.recommendations.forEach(rec => {
      csvContent += `권고사항,"${rec.item}","${rec.priority} - ${rec.action} (${rec.deadline})"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `취업규칙_분석결과_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <div className="space-y-8">
            {/* 파일 업로드 영역 */}
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${isAnalyzing ? 'opacity-60 pointer-events-none' : ''} bg-white dark:bg-gray-800`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileInput"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInput}
                accept=".txt,.pdf,.doc,.docx"
                disabled={isAnalyzing}
              />

              <div className="space-y-4">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center">
                    {/* 진행률 원형 표시 */}
                    <div className="relative w-20 h-20 mb-6">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="14" stroke="#e5e7eb" strokeWidth="2" fill="none"/>
                        <circle 
                          cx="16" 
                          cy="16" 
                          r="14" 
                          stroke="#3182F6" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 14}`}
                          strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
                      </div>
                    </div>
                    
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      🤖 AI 분석 진행중
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      법적 준수 여부를 검토하고 있습니다...
                    </p>
                    
                    {/* 진행률 바 */}
                    <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        취업규칙 업로드
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mb-1">
                        파일을 선택하거나 드래그해주세요
                      </p>
                      <p className="text-sm text-gray-400">
                        TXT, PDF, DOC, DOCX · 최대 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 선택된 파일 정보 */}
            {file && !isAnalyzing && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <div className="text-red-600 dark:text-red-400 mr-2">⚠️</div>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* AI 분석 버튼 */}
            <div className="flex items-center justify-center">
              {file && !isAnalyzing ? (
                <button
                  onClick={startAnalysis}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-2xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md active:scale-95 w-full sm:w-auto"
                >
                  🤖 AI 분석 시작
                </button>
              ) : !file && !isAnalyzing ? (
                <div className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-400 text-base rounded-2xl font-semibold w-full sm:w-auto text-center cursor-not-allowed">
                  파일을 먼저 선택해주세요
                </div>
              ) : null}
            </div>

            {/* 기능 소개 - 파일이 선택되지 않았을 때만 표시 */}
            {!file && (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">법적 준수 검토</h3>
                    <p className="leading-relaxed text-gray-600 dark:text-gray-300">근로기준법 및 관련 법령 준수 여부를 정밀 분석합니다</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-900 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">위험요소 식별</h3>
                    <p className="leading-relaxed text-gray-600 dark:text-gray-300">잠재적 법적 리스크와 개선이 필요한 부분을 찾아냅니다</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">개선방안 제시</h3>
                    <p className="leading-relaxed text-gray-600 dark:text-gray-300">구체적이고 실행 가능한 개선 권고사항을 제공합니다</p>
                  </div>
                </div>

                {/* 지원 파일 형식 */}
                <div className="border rounded-2xl p-8 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                  <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-200">지원 파일 형식</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['TXT', 'PDF', 'DOC', 'DOCX'].map((format) => (
                      <div key={format} className="flex items-center text-blue-800 dark:text-blue-300">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-blue-100 dark:bg-blue-800">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <span className="font-medium">{format}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm mt-4 text-blue-700 dark:text-blue-400">
                    최대 파일 크기: 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* 분석 결과 화면 */
          <div className="space-y-8">
            {/* 결과 헤더 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🎉 분석 완료!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  파일: {analysisResult.fileName} ({analysisResult.fileSize})
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  분석일시: {analysisResult.analysisDate} {analysisResult.analysisTime}
                </p>
              </div>

              {/* 액션 버튼 - 결과 헤더 바로 아래로 이동 */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <button
                  onClick={startNewAnalysis}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  🔄 새 분석 시작
                </button>
                
                {/* 엑셀 다운로드 */}
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors duration-200"
                  onClick={() => downloadExcel(analysisResult)}
                >
                  📊 엑셀 다운로드
                </button>
                
                {/* 구글시트 다운로드 */}
                <button
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors duration-200"
                  onClick={() => downloadGoogleSheets(analysisResult)}
                >
                  📋 구글시트 다운로드
                </button>
                
                {/* 워드 다운로드 */}
                <button
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => downloadWord(analysisResult)}
                >
                  📄 워드 다운로드
                </button>
                
                {/* CSV 다운로드 */}
                <button
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => downloadCSV(analysisResult)}
                >
                  📋 CSV 다운로드
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  🖨️ 인쇄하기
                </button>
              </div>

              {/* 준수율 표시 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">법적 준수율</h3>
                    <p className="text-gray-600 dark:text-gray-300">전체 항목 대비 준수 비율</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{analysisResult.complianceScore}%</div>
                    <div className="text-lg font-medium text-purple-600 dark:text-purple-400">{analysisResult.complianceGrade}</div>
                  </div>
                </div>
              </div>

              {/* 분석 요약 */}
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📋 분석 요약</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.summary}</p>
              </div>
            </div>

            {/* 필수 항목 검토 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📝 필수 항목 검토</h3>
              <div className="space-y-4">
                {analysisResult.requiredItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.item}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === '준수' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.compliance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.compliance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 위험 요소 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">⚠️ 위험 요소</h3>
              <div className="space-y-4">
                {analysisResult.riskFactors.map((risk, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{risk.factor}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        risk.level === '높음' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : risk.level === '중간'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {risk.level}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{risk.description}</p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>권고사항:</strong> {risk.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 개선 권고사항 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">💡 개선 권고사항</h3>
              <div className="space-y-4">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{rec.item}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rec.priority === '높음' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : rec.priority === '중간'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        우선순위: {rec.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{rec.action}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <strong>완료 목표:</strong> {rec.deadline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t mt-16 transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <p>🔒 업로드된 파일은 분석 후 즉시 삭제되며, 어떠한 정보도 저장되지 않습니다.</p>
            <p className="mt-2">⚖️ 본 서비스는 참고용이며, 정확한 법적 검토를 위해서는 전문가 상담을 받으시기 바랍니다.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}