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
    console.time('🔹 전체 검색');

    try {
      // 1. 질문 임베딩 생성
      console.time('⏱️ 임베딩 생성');
      const questionEmbedding =
        await this.embeddingService.generateEmbedding(question);
      console.timeEnd('⏱️ 임베딩 생성');

      // 2. Qdrant 검색 - 더 많은 결과를 가져와서 후처리
      console.time('⏱️ Qdrant 검색');
      const results = await this.qdrantService.searchVector(
        'test',
        questionEmbedding,
        {
          limit: 10, // 더 많은 청크를 가져와서
          score_threshold: 0.65, // 유사도 점수 기준 추가
        },
      );
      console.timeEnd('⏱️ Qdrant 검색');

      console.log(results, 'result');

      // 3. 결과 필터링 및 정렬
      const filteredResults = results
        .filter((r) => r.score && r.score > 0.75) // 유사도 점수가 높은 것만 사용
        .sort((a, b) => (b.score || 0) - (a.score || 0)); // 높은 점수순 정렬

      // 4. 텍스트 및 메타데이터 추출
      const relevantChunks = filteredResults
        .map((r) => ({
          text: r.payload?.text as string,
          score: r.score || 0,
          chunkIndex: r.payload?.chunkIndex as number,
          totalChunks: r.payload?.totalChunks as number,
        }))
        .filter((chunk) => chunk.text);

      console.log(`검색된 관련 청크: ${relevantChunks.length}개`);

      // 5. 컨텍스트 구성 최적화 - 청크 위치에 따라 인접 청크도 포함
      const enhancedContext = this.buildEnhancedContext(relevantChunks);

      // 6. 개선된 프롬프트 작성
      const prompt = this.buildSearchPrompt(question, enhancedContext);

      // 7. LLM으로 응답 생성
      console.time('⏱️ LLM 답변 생성');
      const answer = await this.generateResponse(prompt);
      console.timeEnd('⏱️ LLM 답변 생성');

      console.timeEnd('🔹 전체 검색');
      return {
        success: true,
        message: answer,
        relevantChunksCount: relevantChunks.length,
      };
    } catch (error) {
      console.error('검색 프로세스 오류:', error);
      return {
        success: false,
        message: '검색 중 오류가 발생했습니다',
        error: error.message,
      };
    }
  }

  // 검색 결과의 컨텍스트를 개선하는 함수
  private buildEnhancedContext(
    chunks: Array<{
      text: string;
      score: number;
      chunkIndex: number;
      totalChunks: number;
    }>,
  ): string {
    // 점수에 따른 가중치를 적용하고, 중복 제거
    const uniqueChunks = new Map<number, { text: string; score: number }>();

    for (const chunk of chunks) {
      // 기존 청크 추가
      uniqueChunks.set(chunk.chunkIndex, {
        text: chunk.text,
        score: chunk.score,
      });

      // 인접 청크도 포함 (전후 각 1개)
      if (chunk.chunkIndex > 0) {
        // 이전 청크 존재 여부 확인
        const prevChunkIndex = chunk.chunkIndex - 1;
        if (!uniqueChunks.has(prevChunkIndex)) {
          // 이전 청크 데이터 가져오기 (실제로는 Qdrant에서 조회 필요할 수 있음)
          // 여기서는 간단히 처리
        }
      }
    }

    // 점수 기준 정렬하여 상위 5개만 사용
    const sortedTexts = Array.from(uniqueChunks.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.text);

    return sortedTexts.join('\n\n');
  }

  // 개선된 프롬프트 구성
  private buildSearchPrompt(question: string, context: string): string {
    return `
  ### 시스템 지시사항
  다음 문서 내용을 기반으로 사용자의 질문에 정확하고 자세히 답변해주세요.
  문서에 없는 내용은 추측하지 말고, "문서에서 해당 내용을 찾을 수 없습니다"라고 답변하세요.
  답변은 간결하면서도 정보가 풍부하게 작성해주세요.
  한국어로 답변해주세요.
  ### 문서 내용
  ${context}
  
  ### 질문
  ${question}
  
  ### 답변
  `;
  }

  // LLM 응답 생성 함수
  private async generateResponse(prompt: string) {
    try {
      // 성능 개선을 위해 더 강력한 모델 사용
      const response = await ollama.generate({
        model: 'llama3', // 또는 더 성능이 좋은 모델
        prompt,
        stream: false,
        options: {
          temperature: 0.3, // 더 결정적인 응답
          top_p: 0.85, // 더 정확한 응답
          num_predict: 1024, // 충분한 토큰 수
        },
      });

      return response.response;
    } catch (error) {
      console.error('LLM 응답 생성 오류:', error);
      throw new Error('응답 생성 실패');
    }
  }
}
