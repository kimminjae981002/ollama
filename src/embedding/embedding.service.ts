import { Injectable } from '@nestjs/common';
import ollama from 'ollama';

@Injectable()
export class EmbeddingService {
  async generateEmbedding(text: string) {
    try {
      const response = await ollama.embed({
        model: 'mxbai-embed-large', // 임베딩 모델 다운로드 필요
        input: text,
      });

      return response.embeddings[0];
    } catch (error) {
      console.error('Ollama 임베딩 에러:', error);
      throw new Error('임베딩 실패');
    }
  }
}
