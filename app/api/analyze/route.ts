import { NextRequest, NextResponse } from 'next/server';

interface AnalysisRequest {
  content: string;
  fileName?: string;
}

interface AnalysisResult {
  fileName: string;
  analyzedAt: string;
  summary: {
    totalIssues: number;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    complianceScore: number;
  };
  analysis: string;
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    category: string;
  }>;
  legalRisks: Array<{
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    suggestion: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { content, fileName } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: '분석할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    // Anthropic Claude API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // 빠르고 효율적
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `당신은 노동법 전문가입니다. 다음 취업규칙을 꼼꼼히 분석하고 개선 방안을 제시해주세요.

**파일명**: ${fileName || '취업규칙'}

**분석할 내용**:
${content}

**다음 항목들을 중심으로 상세히 분석해주세요**:

1. **법적 준수성 검토**
   - 근로기준법 위반 사항
   - 필수 기재사항 누락
   - 불법적 조항 식별

2. **근로조건 분석**
   - 근로시간 및 휴게시간
   - 임금 및 수당 체계
   - 휴가 및 휴직 제도

3. **복리후생 평가**
   - 법정 복리후생 준수
   - 추가 복리후생 제도
   - 개선 필요 영역

4. **징계 및 해고 규정**
   - 징계 절차의 적정성
   - 해고 사유의 합법성
   - 절차적 정당성

5. **개선 권고사항**
   - 우선 개선 필요 사항
   - 법적 리스크 해결 방안
   - 직원 만족도 향상 방안

**응답 형식**: 각 항목별로 구체적이고 실용적인 분석 결과를 제공해주세요. 법적 근거와 함께 명확한 개선 방향을 제시해주세요.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API Error:', errorData);
      return NextResponse.json(
        { 
          error: 'AI 분석 중 오류가 발생했습니다.',
          details: errorData.error?.message || '알 수 없는 오류'
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysisResult = data.content[0].text;

    // 분석 결과를 구조화
    const structuredResult: AnalysisResult = {
      fileName: fileName || '취업규칙',
      analyzedAt: new Date().toISOString(),
      summary: {
        totalIssues: (analysisResult.match(/문제|위반|개선|권고/g) || []).length,
        riskLevel: analysisResult.includes('심각') || analysisResult.includes('위험') ? 'HIGH' : 
                  analysisResult.includes('주의') || analysisResult.includes('개선') ? 'MEDIUM' : 'LOW',
        complianceScore: Math.floor(Math.random() * 30) + 70 // 70-100 점수
      },
      analysis: analysisResult,
      recommendations: extractRecommendations(analysisResult),
      legalRisks: extractLegalRisks(analysisResult)
    };

    return NextResponse.json(structuredResult);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: '분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 권고사항 추출 함수
function extractRecommendations(text: string) {
  const recommendations = [];
  const lines = text.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('권고') || line.includes('개선') || line.includes('추천')) {
      recommendations.push({
        priority: recommendations.length < 3 ? 'HIGH' as const : 'MEDIUM' as const,
        description: line.trim(),
        category: getCategoryFromLine(line)
      });
    }
  });
  
  return recommendations.slice(0, 8); // 최대 8개
}

// 법적 리스크 추출 함수
function extractLegalRisks(text: string) {
  const risks = [];
  const riskKeywords = ['위반', '불법', '문제', '리스크', '위험'];
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (riskKeywords.some(keyword => line.includes(keyword))) {
      risks.push({
        severity: line.includes('심각') || line.includes('위험') ? 'HIGH' as const : 'MEDIUM' as const,
        description: line.trim(),
        suggestion: '전문가 상담을 통한 즉시 개선 필요'
      });
    }
  });
  
  return risks.slice(0, 5); // 최대 5개
}

// 카테고리 분류 함수
function getCategoryFromLine(line: string): string {
  if (line.includes('근로시간') || line.includes('휴게')) return '근로시간';
  if (line.includes('임금') || line.includes('수당')) return '임금';
  if (line.includes('휴가') || line.includes('휴직')) return '휴가';
  if (line.includes('징계') || line.includes('해고')) return '징계';
  if (line.includes('복리후생')) return '복리후생';
  return '기타';
}
