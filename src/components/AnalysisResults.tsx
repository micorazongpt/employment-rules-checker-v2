'use client';

import React from 'react';

interface AnalysisData {
  riskLevel: string;
  summary: string;
  requiredItems?: Array<{
    item: string;
    status: string;
    description: string;
  }>;
  riskFactors?: Array<{
    factor: string;
    level: string;
    description: string;
    recommendation: string;
  }>;
  recommendations?: Array<{
    priority: string;
    item: string;
    action: string;
  }>;
  fileName: string;
  fileSize: string;
  analysisDate: string;
  analysisTime: string;
  aiMode?: string;
  note?: string;
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  // 데이터 안전성 검사
  if (!data) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700">분석 데이터를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 기본값 설정
  const safeData = {
    ...data,
    fileName: data.fileName || 'unknown.txt',
    fileSize: data.fileSize || '0 KB',
    analysisDate: data.analysisDate || new Date().toLocaleDateString('ko-KR'),
    analysisTime: data.analysisTime || new Date().toLocaleTimeString('ko-KR'),
    riskLevel: data.riskLevel || '보통',
    summary: data.summary || '분석이 완료되었습니다.',
    requiredItems: data.requiredItems || [],
    riskFactors: data.riskFactors || [],
    recommendations: data.recommendations || []
  };
  const getRiskColor = (level: string) => {
    switch (level) {
      case '높음': return 'text-red-600 bg-red-50 border-red-100';
      case '보통': return 'text-amber-600 bg-amber-50 border-amber-100';
      case '낮음': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '누락': return 'text-red-700 bg-red-50 border-red-200';
      case '부족': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '높음': return 'text-red-700 bg-red-50 border-red-200';
      case '보통': return 'text-amber-700 bg-amber-50 border-amber-200';
      case '낮음': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case '높음': return '🚨';
      case '보통': return '⚠️';
      case '낮음': return '✅';
      default: return '❔';
    }
  };

  const downloadExcel = () => {
    const csvContent = [
      ['구분', '항목', '상태/수준', '설명'],
      ...((data.requiredItems || []).map(item => ['필수항목', item.item, item.status, item.description])),
      ...((data.riskFactors || []).map(factor => ['위험요소', factor.factor, factor.level, factor.description])),
      ...((data.recommendations || []).map(rec => ['권고사항', rec.item, rec.priority, rec.action]))
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `취업규칙_분석결과_${data.fileName.replace(/\.[^/.]+$/, '')}.csv`;
    link.click();
  };

  const downloadWord = () => {
    const wordContent = `
취업규칙 분석 결과

파일명: ${data.fileName}
분석일시: ${data.analysisDate} ${data.analysisTime}
위험도: ${data.riskLevel}

${data.aiMode ? `분석 모드: ${data.aiMode}` : ''}

=== 종합 분석 ===
${data.summary}

=== 필수 기재사항 ===
${(data.requiredItems || []).map(item => 
  `• ${item.item}: ${item.status}\n  ${item.description}`
).join('\n\n')}

=== 위험 요소 ===
${(data.riskFactors || []).map(factor => 
  `• ${factor.factor} (${factor.level})\n  ${factor.description}\n  개선방안: ${factor.recommendation}`
).join('\n\n')}

=== 개선 권고사항 ===
${(data.recommendations || []).map((rec, index) => 
  `${index + 1}. ${rec.item} (${rec.priority})\n   ${rec.action}`
).join('\n\n')}

${data.note ? `\n=== 참고사항 ===\n${data.note}` : ''}
    `;

    const blob = new Blob([wordContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `취업규칙_분석결과_${data.fileName.replace(/\.[^/.]+$/, '')}.txt`;
    link.click();
  };

  const openGoogleSheets = async () => {
    const csvData = [
      ['구분', '항목', '상태/수준', '설명'],
      ...((data.requiredItems || []).map(item => ['필수항목', item.item, item.status, item.description])),
      ...((data.riskFactors || []).map(factor => ['위험요소', factor.factor, factor.level, factor.description])),
      ...((data.recommendations || []).map(rec => ['권고사항', rec.item, rec.priority, rec.action]))
    ];

    // TSV 형식으로 변환 (탭으로 구분)
    const tsvContent = csvData.map(row => row.join('\t')).join('\n');
    
    try {
      await navigator.clipboard.writeText(tsvContent);
      // 구글시트 열기
      window.open('https://sheets.google.com/create', '_blank');
      
      // 사용자에게 안내
      alert(`✅ 데이터가 클립보드에 복사되었습니다!

📋 구글시트 사용법:
1. 구글시트에서 A1 셀 클릭
2. Ctrl+V (또는 Cmd+V) 붙여넣기
3. 데이터가 표 형태로 자동 정렬됩니다

💡 만약 붙여넣기가 안 되면 아래 '수동 입력용 CSV 다운로드' 버튼을 사용하세요.`);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 클립보드 실패 시 CSV 다운로드로 대체
      downloadCsvForSheets();
      window.open('https://sheets.google.com/create', '_blank');
      alert(`⚠️ 클립보드 복사에 실패했습니다.

📥 CSV 파일이 다운로드됩니다.
구글시트에서 '파일 > 가져오기'로 업로드하세요.`);
    }
  };

  const downloadCsvForSheets = () => {
    const csvData = [
      ['구분', '항목', '상태/수준', '설명'],
      ...((data.requiredItems || []).map(item => ['필수항목', item.item, item.status, item.description])),
      ...((data.riskFactors || []).map(factor => ['위험요소', factor.factor, factor.level, factor.description])),
      ...((data.recommendations || []).map(rec => ['권고사항', rec.item, rec.priority, rec.action]))
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `구글시트용_취업규칙분석_${data.fileName.replace(/\.[^/.]+$/, '')}.csv`;
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-6">
      {/* 분석 완료 헤더 - 토스 스타일 */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{backgroundColor: '#EBF2FF'}}>
              <svg className="w-8 h-8" style={{color: '#3182F6'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                분석이 완료되었어요
              </h1>
              <p className="text-gray-600 mb-1">
                {safeData.fileName} · {safeData.fileSize}
              </p>
              <p className="text-sm text-gray-500">
                {safeData.analysisDate} {safeData.analysisTime}
                {safeData.aiMode && ` · ${safeData.aiMode}`}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-2xl border ${getRiskColor(safeData.riskLevel)}`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getRiskIcon(safeData.riskLevel)}</span>
              <span className="font-semibold">위험도 {safeData.riskLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 분석 통계 대시보드 - 새로 추가! */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">총 검토 항목</p>
              <p className="text-2xl font-bold text-gray-900">
                {(safeData.requiredItems?.length || 0) + (safeData.riskFactors?.length || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">높은 위험</p>
              <p className="text-2xl font-bold text-red-600">
                {data.riskFactors?.filter(r => r.level === '높음').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">보통 위험</p>
              <p className="text-2xl font-bold text-amber-600">
                {data.riskFactors?.filter(r => r.level === '보통').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">완료 항목</p>
              <p className="text-2xl font-bold text-emerald-600">
                {data.requiredItems?.filter(r => r.status === '완료').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 결과 다운로드</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={downloadExcel}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">엑셀</span>
          </button>
          
          <button
            onClick={openGoogleSheets}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">구글시트</span>
          </button>
          
          <button
            onClick={downloadCsvForSheets}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">CSV</span>
          </button>
          
          <button
            onClick={downloadWord}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">문서</span>
          </button>
        </div>
      </div>

      {/* 종합 분석 - 토스 스타일 */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">종합 분석</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{safeData.summary}</p>
          </div>
        </div>
      </div>

      {/* 필수 기재사항 - 토스 스타일 */}
      {data.requiredItems && data.requiredItems.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">필수 기재사항</h3>
          </div>
          <div className="grid gap-4">
            {data.requiredItems.map((item, index) => (
              <div key={index} className="border border-gray-100 rounded-2xl p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-lg">{item.item}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 위험 요소 - 개선된 스타일 */}
      {data.riskFactors && data.riskFactors.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">위험 요소 분석</h3>
          </div>

          {/* 위험도별 필터 버튼 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              전체
            </button>
            <button className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
              높은 위험
            </button>
            <button className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">
              보통 위험
            </button>
            <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
              낮은 위험
            </button>
          </div>

          <div className="grid gap-6">
            {data.riskFactors.map((factor, index) => (
              <div key={index} className="border border-gray-100 rounded-2xl p-6 hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      factor.level === '높음' ? 'bg-red-50' :
                      factor.level === '보통' ? 'bg-amber-50' : 'bg-emerald-50'
                    }`}>
                      <span className="text-xl">
                        {factor.level === '높음' ? '🚨' : factor.level === '보통' ? '⚠️' : '✅'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{factor.factor}</h4>
                      <p className="text-gray-600 leading-relaxed mb-4">{factor.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(factor.level)}`}>
                    {factor.level}
                  </span>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">개선 방안</p>
                      <p className="text-blue-800 leading-relaxed">{factor.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 개선 권고사항 - 우선순위별 정렬 */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">개선 권고사항</h3>
          </div>

          <div className="grid gap-4">
            {data.recommendations
              .sort((a, b) => {
                const priorityOrder = { '높음': 0, '보통': 1, '낮음': 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((rec, index) => (
              <div key={index} className="border border-gray-100 rounded-2xl p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" 
                         style={{backgroundColor: rec.priority === '높음' ? '#ef4444' : rec.priority === '보통' ? '#f59e0b' : '#22c55e'}}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{rec.item}</h4>
                      <p className="text-gray-600 leading-relaxed">{rec.action}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 차트 섹션 - 새로 추가! */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 위험도 분포 차트 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">위험도 분포</h3>
          <div className="relative h-64 flex items-center justify-center">
            <canvas id="riskChart" className="w-full h-full"></canvas>
          </div>
        </div>

        {/* 진행 현황 */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">검토 진행 현황</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">필수 항목 완료</span>
                <span className="text-sm font-bold text-emerald-600">
                  {data.requiredItems?.filter(r => r.status === '완료').length || 0}/
                  {data.requiredItems?.length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${data.requiredItems?.length > 0 ? 
                      (data.requiredItems.filter(r => r.status === '완료').length / data.requiredItems.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">위험 요소 해결</span>
                <span className="text-sm font-bold text-blue-600">
                  {data.riskFactors?.filter(r => r.level === '낮음').length || 0}/
                  {data.riskFactors?.length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${data.riskFactors?.length > 0 ? 
                      (data.riskFactors.filter(r => r.level === '낮음').length / data.riskFactors.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">전체 준수율</span>
                <span className="text-sm font-bold text-purple-600">
                  {Math.round(((data.requiredItems?.filter(r => r.status === '완료').length || 0) + 
                    (data.riskFactors?.filter(r => r.level === '낮음').length || 0)) / 
                    Math.max(1, (data.requiredItems?.length || 0) + (data.riskFactors?.length || 0)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(((data.requiredItems?.filter(r => r.status === '완료').length || 0) + 
                      (data.riskFactors?.filter(r => r.level === '낮음').length || 0)) / 
                      Math.max(1, (data.requiredItems?.length || 0) + (data.riskFactors?.length || 0)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {data.note && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>참고:</strong> {data.note}
          </p>
        </div>
      )}

      {/* 새 분석 버튼 */}
      <div className="text-center pt-6">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🔄 새로운 파일 분석하기
        </button>
      </div>
    </div>
  );
}