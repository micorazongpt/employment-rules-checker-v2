'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

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
  const [showBlog, setShowBlog] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // 다크모드 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedApiKey = localStorage.getItem('openai_api_key') || '';
      setDarkMode(savedDarkMode);
      setApiKey(savedApiKey);
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

  // API 키 저장
  const saveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', apiKey);
    }
    setShowApiKeyModal(false);
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
        if (prev >= 95) {
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
    return interval;
  };

  // 파일 내용 읽기 함수
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = (e) => reject(e);
      
      // 파일 타입에 따라 다르게 처리
      if (file.type === 'text/plain') {
        reader.readAsText(file, 'utf-8');
      } else {
        // PDF, DOC, DOCX는 텍스트로 읽기 (기본 처리)
        reader.readAsText(file, 'utf-8');
      }
    });
  };

  // OpenAI API 호출 함수
  const callOpenAI = async (content: string, fileName: string): Promise<AnalysisResult> => {
    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const prompt = `
다음은 취업규칙 문서입니다. 한국의 근로기준법 및 관련 법령에 따라 상세히 분석해주세요.

파일명: ${fileName}
내용:
${content}

다음 형식으로 JSON 응답해주세요:
{
  "complianceScore": 점수(0-100),
  "riskLevel": "높음|중간|낮음",
  "summary": "분석 요약 (2-3문장)",
  "requiredItems": [
    {
      "item": "항목명",
      "status": "준수|개선필요",
      "description": "설명",
      "compliance": 점수(0-100)
    }
  ],
  "riskFactors": [
    {
      "factor": "위험요소명",
      "level": "높음|중간|낮음",
      "description": "설명",
      "recommendation": "권고사항"
    }
  ],
  "recommendations": [
    {
      "priority": "높음|중간|낮음",
      "item": "개선항목",
      "action": "조치사항",
      "deadline": "완료목표"
    }
  ]
}

중요 검토 항목:
1. 근로시간 규정 (주 40시간 원칙, 연장근로 제한)
2. 휴게시간 규정 (4시간 이상 30분, 8시간 이상 1시간)
3. 연차휴가 규정 (법정 연차 기준)
4. 임금 지급 규정 (최저임금, 지급일, 지급방법)
5. 퇴직급여 규정 (퇴직금 또는 퇴직연금)
6. 징계 절차 (소명 기회 보장)
7. 해고 절차 (정당한 사유, 절차)
8. 육아지원 규정 (2025년 개정사항 반영)
9. 안전보건 규정
10. 취업규칙 신고 및 변경 절차

2025년 육아지원3법 개정사항을 반영하여 분석해주세요.
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: '당신은 한국의 노무 전문가입니다. 취업규칙을 근로기준법 및 관련 법령에 따라 정확하게 분석하고, 실용적인 개선 방안을 제시합니다. 응답은 반드시 유효한 JSON 형식이어야 합니다.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // JSON 파싱
      let analysisData;
      try {
        // JSON 응답에서 코드 블록 제거
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
        analysisData = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.log('원본 응답:', aiResponse);
        throw new Error('AI 응답을 파싱할 수 없습니다.');
      }

      // 등급 계산
      const score = analysisData.complianceScore;
      let grade = 'A';
      if (score < 60) grade = 'D';
      else if (score < 70) grade = 'C';
      else if (score < 80) grade = 'C+';
      else if (score < 90) grade = 'B+';

      // 결과 구성
      const result: AnalysisResult = {
        fileName,
        fileSize: `${(content.length / 1024).toFixed(1)} KB`,
        riskLevel: analysisData.riskLevel,
        summary: analysisData.summary,
        complianceScore: analysisData.complianceScore,
        complianceGrade: grade,
        analysisDate: new Date().toLocaleDateString('ko-KR'),
        analysisTime: new Date().toLocaleTimeString('ko-KR'),
        requiredItems: analysisData.requiredItems || [],
        riskFactors: analysisData.riskFactors || [],
        recommendations: analysisData.recommendations || []
      };

      return result;

    } catch (error) {
      console.error('OpenAI API 오류:', error);
      throw error;
    }
  };

  // 분석 시작 (OpenAI API 사용)
  const startAnalysis = async () => {
    if (!file) {
      setError('파일을 먼저 선택해주세요.');
      return;
    }

    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    console.log('OpenAI API를 사용한 실제 분석 시작:', file.name);
    setIsAnalyzing(true);
    setError(null);
    
    const progressInterval = simulateProgress();

    try {
      // 파일 내용 읽기
      const content = await readFileContent(file);
      console.log('파일 내용 읽기 완료, 길이:', content.length);
      
      if (content.length < 100) {
        setError('파일 내용이 너무 짧습니다. 올바른 취업규칙 문서인지 확인해주세요.');
        setIsAnalyzing(false);
        clearInterval(progressInterval);
        return;
      }

      // OpenAI API 호출
      const analysisResult = await callOpenAI(content, file.name);
      console.log('OpenAI 분석 완료:', analysisResult);
      
      setProgress(100);
      setTimeout(() => {
        setAnalysisResult(analysisResult);
        clearInterval(progressInterval);
        setIsAnalyzing(false);
      }, 500);

    } catch (error) {
      console.error('분석 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setError(`분석 중 오류가 발생했습니다: ${errorMessage}`);
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    }
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
    const htmlContent = `
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
        <p>OpenAI GPT-4가 분석한 법적 준수 여부 및 개선 권고사항</p>
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
        <p>본 분석 결과는 OpenAI GPT-4에 의해 생성되었으며, 참고용으로만 사용하시기 바랍니다.</p>
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

  // 블로그 포스트 데이터
  const blogPosts = [
    {
      title: "2025년 2월 육아지원3법 개정사항 완벽 정리",
      excerpt: "2025년 2월부터 시행되는 육아지원3법 개정사항과 기업에서 준비해야 할 필수 체크리스트를 상세히 안내합니다.",
      date: "2025-01-15",
      tags: ["육아지원법", "개정법령", "근로기준법"]
    },
    {
      title: "취업규칙 필수 포함사항 10가지",
      excerpt: "근로기준법을 준수하는 취업규칙 작성을 위해 반드시 포함되어야 하는 10가지 핵심 항목을 정리했습니다.",
      date: "2025-01-10",
      tags: ["취업규칙", "근로기준법", "필수사항"]
    },
    {
      title: "OpenAI GPT-4가 분석하는 취업규칙 위험요소",
      excerpt: "최신 AI 기술을 활용하여 취업규칙의 법적 위험요소를 정밀하게 분석하고 개선방안을 제시합니다.",
      date: "2025-01-05",
      tags: ["AI분석", "위험요소", "법적리스크"]
    }
  ];

  // FAQ 데이터
  const faqs = [
    {
      question: "OpenAI API 키는 어떻게 발급받나요?",
      answer: "OpenAI 웹사이트(platform.openai.com)에 가입 후 API Keys 메뉴에서 새 API 키를 생성할 수 있습니다. API 키는 안전하게 보관하시고, 다른 사람과 공유하지 마세요."
    },
    {
      question: "API 키가 저장되나요?",
      answer: "API 키는 브라우저의 로컬 스토리지에만 저장되며, 서버로 전송되지 않습니다. 언제든지 삭제할 수 있습니다."
    },
    {
      question: "취업규칙 검토는 얼마나 자주 해야 하나요?",
      answer: "법령 개정이나 사업장 규모 변경 시 즉시 검토가 필요하며, 일반적으로 연 1회 정기 검토를 권장합니다. 특히 근로기준법, 남녀고용평등법 등 주요 법령이 개정될 때는 반드시 검토해야 합니다."
    },
    {
      question: "AI 분석 결과를 법적 근거로 사용할 수 있나요?",
      answer: "AI 분석 결과는 참고용으로만 사용하시기 바랍니다. 정확한 법적 검토를 위해서는 반드시 노무사나 변호사 등 전문가의 상담을 받으시기 바랍니다."
    },
    {
      question: "어떤 파일 형식을 지원하나요?",
      answer: "TXT, PDF, DOC, DOCX 파일을 지원합니다. 파일 크기는 최대 10MB까지 업로드 가능합니다."
    }
  ];

  return (
    <>
      {/* SEO 메타 태그 */}
      <Head>
        <title>취업규칙 검토 시스템 | OpenAI GPT-4 AI 분석 도구 | 근로기준법 준수 확인</title>
        <meta name="description" content="OpenAI GPT-4가 취업규칙을 정밀 분석해드립니다. 근로기준법 준수 여부, 법적 리스크 분석, 개선사항 제안까지! 2025년 육아지원3법 개정사항 반영." />
        <meta name="keywords" content="취업규칙, 근로계약서, 근로기준법, OpenAI, GPT-4, AI 분석, 무료 검토, 육아지원3법, 법적 리스크, 컴플라이언스" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="취업규칙 검토 시스템" />
        <link rel="canonical" href="https://employment-rules-checker-v2.vercel.app" />
        
        {/* Open Graph 메타 태그 */}
        <meta property="og:title" content="취업규칙 검토 시스템 | OpenAI GPT-4 AI 분석 도구" />
        <meta property="og:description" content="OpenAI GPT-4가 취업규칙을 정밀 분석해드립니다. 근로기준법 준수 여부, 법적 리스크 분석, 개선사항 제안까지!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://employment-rules-checker-v2.vercel.app" />
        <meta property="og:image" content="https://employment-rules-checker-v2.vercel.app/og-image.jpg" />
        
        {/* Twitter 카드 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="취업규칙 검토 시스템 | OpenAI GPT-4 AI 분석 도구" />
        <meta name="twitter:description" content="OpenAI GPT-4가 취업규칙을 정밀 분석해드립니다. 근로기준법 준수 여부, 법적 리스크 분석, 개선사항 제안까지!" />
        
        {/* 구조화된 데이터 (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "취업규칙 검토 시스템",
            "description": "OpenAI GPT-4가 취업규칙을 정밀 분석해드립니다",
            "url": "https://employment-rules-checker-v2.vercel.app",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "KRW"
            },
            "creator": {
              "@type": "Organization",
              "name": "취업규칙 검토 시스템"
            }
          })}
        </script>
      </Head>

      {/* API 키 설정 모달 */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔑 OpenAI API 키 설정</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              정확한 AI 분석을 위해 OpenAI API 키가 필요합니다.<br/>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                OpenAI 웹사이트
              </a>에서 API 키를 발급받으세요.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... (OpenAI API 키를 입력하세요)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex space-x-4">
              <button
                onClick={saveApiKey}
                disabled={!apiKey.startsWith('sk-')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                저장
              </button>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                취소
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              💡 API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
            </p>
          </div>
        </div>
      )}

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
                  OpenAI GPT-4가 취업규칙을 정밀 분석하고 법적 준수 여부를 확인해드립니다
                </p>
              </div>
              
              {/* 네비게이션 메뉴 */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowBlog(!showBlog)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  블로그
                </button>
                <button
                  onClick={() => setShowFAQ(!showFAQ)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  FAQ
                </button>
                
                {/* API 키 설정 버튼 */}
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    apiKey 
                      ? darkMode 
                        ? 'bg-green-700 text-green-200 hover:bg-green-600' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                      : darkMode 
                        ? 'bg-red-700 text-red-200 hover:bg-red-600' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                  title={apiKey ? 'API 키 설정됨' : 'API 키 설정 필요'}
                >
                  🔑 API
                </button>
                
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

        {/* 메인 콘텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 블로그 섹션 */}
          {showBlog && (
            <div className="mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📰 최신 법령 소식</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts.map((post, index) => (
                    <article key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{post.date}</span>
                        <div className="flex space-x-2">
                          {post.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQ 섹션 */}
          {showFAQ && (
            <div className="mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">❓ 자주 묻는 질문</h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{faq.question}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!analysisResult ? (
            <div className="space-y-8">
              {/* OpenAI API 키 안내 */}
              {!apiKey && (
                <div className="border rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">🔑 OpenAI API 키 설정 필요</h3>
                      <p className="text-blue-700 dark:text-blue-300">정확한 AI 분석을 위해 OpenAI API 키를 설정해주세요.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    API 키 설정하기
                  </button>
                </div>
              )}

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
                        🤖 OpenAI GPT-4 분석 진행중
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        법적 준수 여부를 정밀 검토하고 있습니다...
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
                    🤖 OpenAI GPT-4 분석 시작
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
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">OpenAI GPT-4 분석</h3>
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">최신 AI 기술로 근로기준법 및 관련 법령 준수 여부를 정밀 분석합니다</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-900 flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">위험요소 식별</h3>
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">잠재적 법적 리스크와 개선이 필요한 부분을 AI가 찾아냅니다</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900 flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">개선방안 제시</h3>
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">구체적이고 실행 가능한 개선 권고사항을 AI가 제공합니다</p>
                    </div>
                  </div>

                  {/* 2025년 육아지원3법 특별 안내 */}
                  <div className="border rounded-2xl p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-100 dark:border-purple-800">
                    <h3 className="text-xl font-bold mb-4 text-purple-900 dark:text-purple-200">🆕 2025년 2월 육아지원3법 개정사항 반영</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center text-purple-800 dark:text-purple-300">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-purple-100 dark:bg-purple-800">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <span className="font-medium">육아휴직 확대</span>
                      </div>
                      <div className="flex items-center text-purple-800 dark:text-purple-300">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-purple-100 dark:bg-purple-800">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                        </div>
                        <span className="font-medium">출산전후휴가 개선</span>
                      </div>
                      <div className="flex items-center text-purple-800 dark:text-purple-300">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-purple-100 dark:bg-purple-800">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <span className="font-medium">배우자 출산휴가</span>
                      </div>
                    </div>
                    <p className="text-sm mt-4 text-purple-700 dark:text-purple-400">
                      OpenAI GPT-4가 최신 법령 개정사항을 자동으로 분석에 반영합니다
                    </p>
                  </div>

                  {/* OpenAI GPT-4 특별 안내 */}
                  <div className="border rounded-2xl p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-100 dark:border-green-800">
                    <h3 className="text-xl font-bold mb-4 text-green-900 dark:text-green-200">🤖 OpenAI GPT-4 기반 정밀 분석</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center text-green-800 dark:text-green-300">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-green-100 dark:bg-green-800">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        </div>
                        <span className="font-medium">최신 AI 기술 활용</span>
                      </div>
                      <div className="flex items-center text-green-800 dark:text-green-300">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-green-100 dark:bg-green-800">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                        </div>
                        <span className="font-medium">데이터 보안 보장</span>
                      </div>
                    </div>
                    <p className="text-sm mt-4 text-green-700 dark:text-green-400">
                      OpenAI API를 통해 업계 최고 수준의 AI 분석을 제공하며, 모든 데이터는 안전하게 처리됩니다
                    </p>
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
                    🎉 OpenAI GPT-4 분석 완료!
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
                      <p className="text-gray-600 dark:text-gray-300">OpenAI GPT-4가 분석한 전체 항목 대비 준수 비율</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{analysisResult.complianceScore}%</div>
                      <div className="text-lg font-medium text-purple-600 dark:text-purple-400">{analysisResult.complianceGrade}</div>
                    </div>
                  </div>
                </div>

                {/* 분석 요약 */}
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📋 AI 분석 요약</h3>
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
                          <strong>AI 권고사항:</strong> {risk.recommendation}
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

              {/* SEO용 추가 콘텐츠 */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔍 관련 서비스</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 연차 계산기</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">입사일 기준 정확한 연차 개수를 AI가 자동으로 계산해드립니다</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">곧 출시</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 퇴직금 계산기</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">근무기간별 정확한 퇴직금 산정을 AI가 도와드립니다</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">곧 출시</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 푸터 */}
        <footer className="border-t mt-16 transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* 회사 정보 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">취업규칙 검토 시스템</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  OpenAI GPT-4 기술로 취업규칙의 법적 준수 여부를 신속하고 정확하게 검토해드립니다.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* 서비스 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">서비스</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">OpenAI 취업규칙 검토</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">AI 근로계약서 분석</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">법령 검색</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">연차 계산기</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">퇴직금 계산기</a></li>
                </ul>
              </div>

              {/* 지원 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">지원</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">사용 가이드</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">자주 묻는 질문</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">고객 지원</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">개인정보처리방침</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">이용약관</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
              <div className="text-center text-gray-400 dark:text-gray-500">
                <p className="mb-2">🔒 업로드된 파일은 분석 후 즉시 삭제되며, OpenAI API를 통해 안전하게 처리됩니다.</p>
                <p className="mb-4">⚖️ 본 서비스는 OpenAI GPT-4 기반 참고용이며, 정확한 법적 검토를 위해서는 전문가 상담을 받으시기 바랍니다.</p>
                <p>&copy; 2025 취업규칙 검토 시스템. All rights reserved. Powered by OpenAI GPT-4.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}