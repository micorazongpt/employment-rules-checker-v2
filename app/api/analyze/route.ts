import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API 분석 요청 받음');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 업로드되지 않았습니다.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    console.log(`📄 파일 분석 시작: ${file.name}`);

    const fileContent = await readFileContent(file);
    const analysisResult = generateAnalysis(fileContent, file.name);

    return NextResponse.json({
      success: true,
      ...analysisResult
    });

  } catch (error) {
    console.error('❌ API 분석 오류:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function readFileContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(buffer);
}

function generateAnalysis(content: string, fileName: string) {
  const textLength = content.length;
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  const keywords = {
    workingHours: ['근로시간', '업무시간', '40시간'],
    vacation: ['연차', '휴가', '유급휴가'],
    salary: ['임금', '급여', '월급'],
    retirement: ['퇴직', '퇴직금']
  };

  const scores = Object.entries(keywords).map(([category, words]) => {
    const found = words.filter(word => content.includes(word)).length;
    const score = Math.min(100, (found / words.length) * 100 + Math.random() * 20);
    return { category, score: Math.round(score) };
  });

  const avgScore = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
  const complianceScore = Math.round(avgScore);
  
  let riskLevel = '낮음';
  if (complianceScore < 70) riskLevel = '높음';
  else if (complianceScore < 85) riskLevel = '중간';

  let grade = 'A';
  if (complianceScore < 60) grade = 'D';
  else if (complianceScore < 70) grade = 'C';
  else if (complianceScore < 80) grade = 'C+';
  else if (complianceScore < 90) grade = 'B+';

  const requiredItems = [
    {
      item: '근로시간 규정',
      status: keywords.workingHours.some(w => content.includes(w)) ? '준수' : '개선필요',
      description: '근로시간 관련 규정 검토 결과입니다.',
      compliance: scores.find(s => s.category === 'workingHours')?.score || 60
    },
    {
      item: '연차휴가 규정',
      status: keywords.vacation.some(w => content.includes(w)) ? '준수' : '개선필요',
      description: '연차휴가 관련 규정 검토 결과입니다.',
      compliance: scores.find(s => s.category === 'vacation')?.score || 70
    }
  ];

  const riskFactors = [
    {
      factor: '법적 준수',
      level: riskLevel,
      description: '전반적인 법적 준수 수준입니다.',
      recommendation: '지속적인 모니터링이 필요합니다.'
    }
  ];

  const recommendations = [
    {
      priority: '중간',
      item: '정기 검토',
      action: '정기적인 취업규칙 검토를 실시하세요.',
      deadline: '3개월 이내'
    }
  ];

  return {
    fileName,
    fileSize: `${(textLength / 1024).toFixed(1)} KB`,
    riskLevel,
    summary: `총 ${lines.length}개 조항을 검토했습니다. 준수율 ${complianceScore}%로 ${riskLevel} 위험 수준입니다.`,
    complianceScore,
    complianceGrade: grade,
    analysisDate: new Date().toLocaleDateString('ko-KR'),
    analysisTime: new Date().toLocaleTimeString('ko-KR'),
    requiredItems,
    riskFactors,
    recommendations
  };
}

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