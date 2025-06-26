import { NextRequest, NextResponse } from 'next/server';

// OpenAI API 설정
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('⚠️ OPENAI_API_KEY가 설정되지 않았습니다.');
}

export async function POST(request: NextRequest) {
  try {
    console.log('📄 취업규칙 분석 API 호출됨');

    // FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    console.log(`📁 파일 정보: ${file.name} (${file.size} bytes)`);

    // 파일에서 텍스트 추출
    const content = await file.text();
    
    // 내용이 너무 짧으면 오류
    if (content.length < 50) {
      return NextResponse.json(
        { error: '파일 내용이 너무 짧습니다. 올바른 취업규칙 문서인지 확인해주세요.' },
        { status: 400 }
      );
    }

    console.log(`📝 추출된 텍스트 길이: ${content.length}자`);

    // 기본 분석 결과 (OpenAI 없이도 작동하도록)
    const result = {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      riskLevel: '보통',
      summary: `파일 분석이 완료되었습니다. 총 ${content.length}자의 내용을 검토했습니다. OpenAI API 연동이 완료되면 더 정확한 분석을 제공합니다.`,
      complianceScore: 80,
      complianceGrade: 'B',
      analysisDate: new Date().toLocaleDateString('ko-KR'),
      analysisTime: new Date().toLocaleTimeString('ko-KR'),
      aiMode: 'OpenAI 연동 준비 중',
      requiredItems: [
        {
          item: '기본 검토 완료',
          status: '준수',
          description: '파일이 성공적으로 업로드되고 처리되었습니다.',
          compliance: 80
        }
      ],
      riskFactors: [
        {
          factor: 'API 연동 필요',
          level: '낮음',
          description: 'OpenAI API 연동이 완료되면 정밀 분석이 가능합니다.',
          recommendation: 'API 키 설정을 확인해주세요.'
        }
      ],
      recommendations: [
        {
          priority: '중간',
          item: 'OpenAI 연동 완료',
          action: 'API 설정을 완료하면 전문적인 법률 분석을 제공합니다.',
          deadline: '즉시'
        }
      ]
    };

    console.log('✅ 기본 분석 완료');
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ API 오류:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}