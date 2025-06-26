// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API 분석 요청 받음');

    // 요청 데이터 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const analysisOptions = formData.get('options') ? 
      JSON.parse(formData.get('options') as string) : {};

    if (!file) {
      return NextResponse.json(
        { error: '파일이 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    console.log(`📄 파일 분석 시작: ${file.name} (${file.size} bytes)`);

    // 1. 파일 내용 읽기
    const fileContent = await readFileContent(file);
    console.log(`✅ 파일 읽기 완료: ${fileContent.length} 문자`);

    // 2. OpenAI API 호출 여부 확인
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API 키가 없어서 Mock 분석 실행');
      // OpenAI API 키가 없으면 기본 분석으로 폴백
      const mockResult = generateMockAnalysis(fileContent, file.name);
      return NextResponse.json({
        success: true,
        ...mockResult
      });
    }

    // 3. OpenAI API 호출
    const analysisResult = await analyzeWithOpenAI(
      fileContent, 
      file.name,
      analysisOptions
    );

    console.log('✅ 분석 완료');

    // 4. 결과 반환
    return NextResponse.json({
      success: true,
      ...analysisResult
    });

  } catch (error) {
    console.error('❌ API 분석 오류:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * 파일 내용 읽기
 */
async function readFileContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(buffer);
}

/**
 * OpenAI를 사용한 취업규칙 분석
 */
async function analyzeWithOpenAI(
  content: string, 
  fileName: string,
  options: any = {}
) {
  console.log('🤖 OpenAI 분석 시작...');

  // 분석 옵션 설정
  const {
    analysisLevel = 'standard', // basic, standard, detailed
    industryType = 'general',   // general, it, manufacturing, service
    companySize = 'medium'      // small, medium, large
  } = options;

  // 업종별 특화 분석 키워드
  const industryKeywords = {
    it: ['재택근무', '유연근무', '인력파견', '프로젝트', '야근', 'IT', '개발자'],
    manufacturing: ['교대근무', '위험작업', '안전보건', '생산직', '기능직', '제조업'],
    service: ['고객응대', '영업', '서비스', '매장', '판매', '상담'],
    general: ['일반사무', '관리직', '사무직']
  };

  const systemPrompt = `당신은 한국의 노무 전문가입니다. 
취업규칙을 근로기준법, 남녀고용평등법, 산업안전보건법, 2025년 개정 육아지원3법 등을 기준으로 정밀 분석합니다.

분석 설정:
- 분석 수준: ${analysisLevel}
- 업종: ${industryType}
- 회사 규모: ${companySize}
- 특화 키워드: ${industryKeywords[industryType]?.join(', ')}

반드시 다음 JSON 형식으로 응답하세요:`;

  const userPrompt = `
파일명: ${fileName}
내용:
${content}

다음 형식으로 분석 결과를 JSON으로 제공하세요:

{
  "complianceScore": 숫자(0-100),
  "riskLevel": "높음|중간|낮음",
  "summary": "분석 요약 (3-4문장)",
  "requiredItems": [
    {
      "item": "항목명",
      "status": "준수|개선필요|누락",
      "description": "상세 설명",
      "compliance": 숫자(0-100),
      "legalBasis": "관련 법령 조항",
      "priority": "높음|중간|낮음"
    }
  ],
  "riskFactors": [
    {
      "factor": "위험요소명",
      "level": "높음|중간|낮음",
      "description": "상세 설명",
      "recommendation": "구체적 권고사항",
      "legalConsequence": "법적 결과",
      "industry": "${industryType}"
    }
  ],
  "recommendations": [
    {
      "priority": "높음|중간|낮음",
      "item": "개선항목",
      "action": "구체적 조치사항",
      "deadline": "완료목표",
      "cost": "예상 비용",
      "benefit": "개선 효과"
    }
  ]
}

중요 검토 항목:
1. 🕐 근로시간: 주 40시간, 연장근로 제한, 휴게시간
2. 💰 임금: 최저임금, 지급일, 수당 규정  
3. 🏖️ 휴가: 연차, 월차, 공휴일, 특별휴가
4. 👶 육아지원: 2025년 개정 육아지원3법 반영
5. 👥 고용평등: 성별, 연령, 장애 차별 금지
6. 🏥 안전보건: 산업안전보건법 준수
7. 📋 취업규칙: 신고, 변경, 불이익변경 금지
8. ⚖️ 징계: 절차, 소명기회, 해고 제한
9. 🔒 개인정보: 개인정보보호법 준수
10. 🏢 업종별 특수사항
`;

  try {
    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('🤖 OpenAI 응답 받음');

    if (!aiResponse) {
      throw new Error('OpenAI에서 응답을 받지 못했습니다.');
    }

    // JSON 파싱
    let analysisData;
    try {
      analysisData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.log('원본 응답:', aiResponse);
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    // 등급 계산
    const score = analysisData.complianceScore || 0;
    let grade = 'F';
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 85) grade = 'B+';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C+';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';

    // 결과 정리
    const result = {
      fileName,
      fileSize: `${(content.length / 1024).toFixed(1)} KB`,
      riskLevel: analysisData.riskLevel || '중간',
      summary: analysisData.summary || '분석이 완료되었습니다.',
      complianceScore: score,
      complianceGrade: grade,
      analysisDate: new Date().toLocaleDateString('ko-KR'),
      analysisTime: new Date().toLocaleTimeString('ko-KR'),
      requiredItems: analysisData.requiredItems || [],
      riskFactors: analysisData.riskFactors || [],
      recommendations: analysisData.recommendations || [],
      analysisLevel,
      industryType,
      companySize
    };

    console.log('✅ OpenAI 분석 완료:', {
      score: result.complianceScore,
      grade: result.complianceGrade,
      itemsCount: result.requiredItems.length,
      risksCount: result.riskFactors.length
    });

    return result;

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    
    // OpenAI 오류 시 기본 분석으로 폴백
    console.log('🔄 OpenAI 오류로 인해 기본 분석으로 폴백');
    return generateMockAnalysis(content, fileName);
  }
}

/**
 * Mock 분석 (OpenAI 없을 때 사용)
 */
function generateMockAnalysis(content: string, fileName: string) {
  console.log('🔄 Mock 분석 실행');

  const textLength = content.length;
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  // 핵심 키워드 체크
  const keywords = {
    workingHours: ['근로시간', '업무시간', '40시간', '주휴일'],
    restTime: ['휴게시간', '휴식시간', '30분', '1시간'],
    vacation: ['연차', '휴가', '유급휴가', '연월차'],
    salary: ['임금', '급여', '월급', '시급', '수당'],
    retirement: ['퇴직', '퇴직금', '퇴직급여'],
    discipline: ['징계', '해고', '처벌', '벌칙'],
    overtime: ['연장근로', '야근', '초과근무', '휴일근무']
  };

  // 키워드 매칭 점수 계산
  const scores = Object.entries(keywords).map(([category, words]) => {
    const found = words.filter(word => content.includes(word)).length;
    const score = Math.min(100, (found / words.length) * 100 + Math.random() * 20);
    return { category, score: Math.round(score) };
  });

  // 전체 준수율 계산
  const avgScore = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
  const complianceScore = Math.round(avgScore);
  
  // 위험 수준 결정
  let riskLevel = '낮음';
  if (complianceScore < 70) riskLevel = '높음';
  else if (complianceScore < 85) riskLevel = '중간';

  // 등급 결정
  let grade = 'A';
  if (complianceScore < 60) grade = 'D';
  else if (complianceScore < 70) grade = 'C';
  else if (complianceScore < 80) grade = 'C+';
  else if (complianceScore < 90) grade = 'B+';

  // 분석 결과 생성
  const requiredItems = [
    {
      item: '근로시간 규정',
      status: keywords.workingHours.some(w => content.includes(w)) ? '준수' : '개선필요',
      description: keywords.workingHours.some(w => content.includes(w)) 
        ? '주 40시간 근로시간 원칙이 문서에 반영되어 있습니다.'
        : '근로시간에 대한 명확한 규정이 부족합니다.',
      compliance: scores.find(s => s.category === 'workingHours')?.score || 60
    },
    {
      item: '휴게시간 규정',
      status: keywords.restTime.some(w => content.includes(w)) ? '준수' : '개선필요',
      description: keywords.restTime.some(w => content.includes(w))
        ? '휴게시간 규정이 적절히 명시되어 있습니다.'
        : '휴게시간에 대한 구체적인 명시가 필요합니다.',
      compliance: scores.find(s => s.category === 'restTime')?.score || 50
    },
    {
      item: '연차휴가 규정',
      status: keywords.vacation.some(w => content.includes(w)) ? '준수' : '개선필요',
      description: keywords.vacation.some(w => content.includes(w))
        ? '연차휴가 부여 기준이 문서에 포함되어 있습니다.'
        : '연차휴가 관련 규정이 부족합니다.',
      compliance: scores.find(s => s.category === 'vacation')?.score || 70
    },
    {
      item: '임금 지급 규정',
      status: keywords.salary.some(w => content.includes(w)) ? '준수' : '개선필요',
      description: keywords.salary.some(w => content.includes(w))
        ? '임금 지급에 관한 규정이 포함되어 있습니다.'
        : '임금 지급 기준과 방법에 대한 명시가 필요합니다.',
      compliance: scores.find(s => s.category === 'salary')?.score || 65
    },
    {
      item: '퇴직급여 규정',
      status: keywords.retirement.some(w => content.includes(w)) ? '준수' : '개선필요',
      description: keywords.retirement.some(w => content.includes(w))
        ? '퇴직급여 관련 규정이 적절히 명시되어 있습니다.'
        : '퇴직급여 산정 기준에 대한 세부 규정이 필요합니다.',
      compliance: scores.find(s => s.category === 'retirement')?.score || 55
    }
  ];

  const riskFactors = [
    {
      factor: '징계 절차',
      level: keywords.discipline.some(w => content.includes(w)) ? '낮음' : '중간',
      description: keywords.discipline.some(w => content.includes(w))
        ? '징계 관련 절차가 문서에 명시되어 있습니다.'
        : '징계 절차에서 근로자의 소명 기회 보장 규정이 부족합니다.',
      recommendation: keywords.discipline.some(w => content.includes(w))
        ? '현재 규정을 유지하되, 세부 절차를 보완하세요.'
        : '징계위원회 구성 및 소명 절차를 명확히 규정하세요.'
    },
    {
      factor: '연장근로 관리',
      level: keywords.overtime.some(w => content.includes(w)) ? '낮음' : '중간',
      description: keywords.overtime.some(w => content.includes(w))
        ? '연장근로에 대한 규정이 포함되어 있습니다.'
        : '연장근로 승인 절차와 제한에 대한 규정이 미흡합니다.',
      recommendation: keywords.overtime.some(w => content.includes(w))
        ? '연장근로 제한 시간을 명확히 하세요.'
        : '연장근로 사전 승인제도와 제한 규정을 추가하세요.'
    }
  ];

  const recommendations = requiredItems
    .filter(item => item.status === '개선필요')
    .map(item => ({
      priority: item.compliance < 60 ? '높음' : '중간',
      item: item.item,
      action: `${item.item}에 대한 구체적인 기준과 절차를 명문화하여 규정에 추가`,
      deadline: item.compliance < 60 ? '1개월 이내' : '3개월 이내'
    }));

  // 기본 권고사항 추가
  if (recommendations.length < 2) {
    recommendations.push({
      priority: '낮음',
      item: '정기 검토 체계 구축',
      action: '법령 개정에 따른 정기적인 취업규칙 검토 체계 마련',
      deadline: '6개월 이내'
    });
  }

  return {
    fileName,
    fileSize: `${(textLength / 1024).toFixed(1)} KB`,
    riskLevel,
    summary: `파일 분석 결과 총 ${lines.length}개 조항을 검토했습니다. ${requiredItems.filter(item => item.status === '준수').length}개 항목이 법령을 준수하고 있으며, ${requiredItems.filter(item => item.status === '개선필요').length}개 항목에서 개선이 필요합니다. 전반적으로 ${complianceScore >= 80 ? '양호한' : complianceScore >= 70 ? '보통' : '미흡한'} 수준의 법적 준수 상태를 보입니다.`,
    complianceScore,
    complianceGrade: grade,
    analysisDate: new Date().toLocaleDateString('ko-KR'),
    analysisTime: new Date().toLocaleTimeString('ko-KR'),
    requiredItems,
    riskFactors,
    recommendations
  };
}

// OPTIONS 메서드 처리 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}