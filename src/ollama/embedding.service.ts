import { Injectable } from '@nestjs/common';
import ollama from 'ollama';

@Injectable()
export class EmbeddingService {
  // text를 embed 해 주는 함수
  async generateEmbedding(text: string) {
    try {
      const response = await ollama.embed({
        model: 'nomic-embed-text', // 임베딩 모델 다운로드 필요
        input: text,
      });

      return response.embeddings[0];
    } catch (error) {
      console.error('Ollama 임베딩 에러:', error);
      throw new Error('임베딩 실패');
    }
  }
}
