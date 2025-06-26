'use client';

import React, { useState } from 'react';

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

interface AnalysisResultsProps {
  data: AnalysisData;
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getRiskColor = (level: string) => {
    switch (level) {
      case '높음':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case '보통':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case '낮음':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '높음':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case '중간':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '낮음':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '적정':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '보완필요':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '부적정':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const startNewAnalysis = () => {
    window.location.reload();
  };

  const downloadResults = () => {
    const reportData = {
      title: '취업규칙 분석 보고서',
      fileName: data.fileName,
      analysisDate: data.analysisDate,
      riskLevel: data.riskLevel,
      complianceScore: data.complianceScore,
      summary: data.summary,
      requiredItems: data.requiredItems,
      riskFactors: data.riskFactors,
      recommendations: data.recommendations
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `취업규칙_분석보고서_${data.analysisDate.replace(/\./g, '')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 분석 완료!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {data.fileName} · {data.fileSize}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex px-4 py-2 rounded-full border font-medium ${getRiskColor(data.riskLevel)}`}>
              위험도: {data.riskLevel}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {data.analysisDate} {data.analysisTime}
            </p>
          </div>
        </div>

        {data.complianceScore && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">법적 준수율</h3>
                <p className="text-gray-600 dark:text-gray-300">전체 항목 대비 준수 비율</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{data.complianceScore}%</div>
                {data.complianceGrade && (
                  <div className="text-lg font-medium text-gray-600 dark:text-gray-300">{data.complianceGrade}</div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${data.complianceScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📋 분석 요약</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={startNewAnalysis}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            🔄 새 분석 시작
          </button>
          <button
            onClick={downloadResults}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors duration-200"
          >
            📥 결과 다운로드
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            🖨️ 인쇄
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {[
              { id: 'overview', label: '📊 개요', count: null },
              { id: 'required', label: '📋 필수항목', count: data.requiredItems?.length },
              { id: 'risks', label: '⚠️ 위험요소', count: data.riskFactors?.length },
              { id: 'recommendations', label: '💡 개선사항', count: data.recommendations?.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' 
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {data.requiredItems?.length || 0}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">검토 항목</div>
                </div>
                <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {data.riskFactors?.length || 0}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">위험 요소</div>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {data.recommendations?.length || 0}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">개선 권고</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">분석 정보</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">파일명:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{data.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">파일 크기:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{data.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">분석 일시:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{data.analysisDate} {data.analysisTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">분석 모드:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{data.aiMode || 'AI 분석'}</span>
                  </div>
                </div>
              </div>

              {data.note && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">참고사항</h4>
                      <p className="text-amber-700 dark:text-amber-400 text-sm">{data.note}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'required' && (
            <div className="space-y-4">
              {data.requiredItems && data.requiredItems.length > 0 ? (
                data.requiredItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{item.item}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
                    
                    {item.compliance && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">준수율</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.compliance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              item.compliance >= 90 ? 'bg-green-500' :
                              item.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.compliance}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  검토된 필수 항목이 없습니다.
                </div>
              )}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-4">
              {data.riskFactors && data.riskFactors.length > 0 ? (
                data.riskFactors.map((risk, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{risk.factor}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(risk.level)}`}>
                        {risk.level}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{risk.description}</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">💡 개선 방안</h5>
                      <p className="text-blue-800 dark:text-blue-400 text-sm">{risk.recommendation}</p>
                    </div>

                    {risk.legalBasis && (
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">법적 근거: </span>
                        <span className="text-gray-900 dark:text-white font-medium">{risk.legalBasis}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  발견된 위험 요소가 없습니다.
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {data.recommendations && data.recommendations.length > 0 ? (
                data.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.item}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">📋 조치 사항</h5>
                        <p className="text-gray-600 dark:text-gray-300">{rec.action}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {rec.deadline && (
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">⏰ 권장 기한</h5>
                            <p className="text-gray-600 dark:text-gray-300">{rec.deadline}</p>
                          </div>
                        )}

                        {rec.legalRisk && (
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">⚠️ 법적 리스크</h5>
                            <p className="text-red-600 dark:text-red-400">{rec.legalRisk}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  특별한 개선 권고사항이 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}