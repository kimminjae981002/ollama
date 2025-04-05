import { Injectable } from '@nestjs/common';
import ollama from 'ollama';

@Injectable()
export class EmbeddingService {
  async generateEmbedding(text: string) {
    try {
      const response = await ollama.embed({
        model: 'mxbai-embed-large',
        input: text,
      });

      return response.embeddings[0];
    } catch (error) {
      console.error('Error while generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
