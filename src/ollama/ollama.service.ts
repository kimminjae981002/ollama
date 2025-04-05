import { EmbeddingService } from 'src/ollama/embedding.service';
import { Injectable } from '@nestjs/common';
import ollama from 'ollama';
import { QdrantService } from 'src/qdrant/qdrant.service';

@Injectable()
export class OllamaService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
  ) {}
  async search(question: string) {
    // 질문을 임베딩
    console.time('🔹 전체 검색');
    console.time('⏱️ 임베딩 생성');
    const questionEmbedding =
      await this.embeddingService.generateEmbedding(question);
    console.timeEnd('⏱️ 임베딩 생성');

    console.time('⏱️ Qdrant 검색');
    // 질문을 Qdrant에서 찾아온다.
    const results = await this.qdrantService.searchVector(
      'test',
      questionEmbedding,
    );
    console.timeEnd('⏱️ Qdrant 검색');
    // payload에 들어 있는 text만 추출
    const matchedTexts = results
      .map((r) => r.payload?.text)
      .filter((t): t is string => typeof t === 'string');

    // 프롬프트 구성
    const prompt = `다음 내용을 기반으로 질문에 한국어로 답해줘. 내용: ${matchedTexts.join(
      '\n\n',
    )}, 질문: ${question} 지시사항: 내가 한국어로 질문하면 한국어로 대답해줘`;

    // mistral을 이용하여 답변 생성
    console.time('⏱️ LLM 답변 생성');
    const answer = await this.ask(prompt);
    console.timeEnd('⏱️ LLM 답변 생성');
    console.timeEnd('🔹 전체 검색');
    return {
      success: true,
      message: answer,
    };
  }

  // 응답을 생성하는 함수
  async ask(prompt: string) {
    try {
      const response = await ollama.chat({
        model: 'tinyllama',
        messages: [
          {
            role: 'system',
            content:
              '넌 친절한 한국어 비서야. 간결하고 정확하게 한국어로 답해.',
          },
          { role: 'user', content: prompt },
        ],
        stream: false,
      });
      // // model mistral 한국어 답변 llama3 영어답변
      // const response = await ollama.generate({
      //   model: 'tinyllama', // 설치된 모델 이름
      //   prompt,
      //   stream: false,
      // });
      console.log(response, 'test');
      // return response;
    } catch (error) {
      console.error('Ollama 응답 에러:', error);
      throw new Error('Ollama 요청 실패');
    }
  }
}
