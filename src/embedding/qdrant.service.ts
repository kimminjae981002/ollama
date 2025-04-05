import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService {
  // Qdrant 컬렉션에 벡터를 업서트하는 메서드
  async upsertVector(
    collectionName: string,
    vector: number[],
    id: number,
    payload: Record<string, unknown>,
  ) {
    try {
      const client = new QdrantClient({ url: 'http://127.0.0.1:6333' });

      // 컬렉션 만들기
      await client.createCollection(collectionName, {
        vectors: {
          size: vector.length, // 임베딩 차원 수로 지정
          distance: 'Cosine',
        },
      });

      // Qdrant 컬렉션에 벡터 업서트
      const response = await client.upsert(collectionName, {
        points: [
          {
            id, // 고유 ID
            vector, // 벡터 데이터
            payload, // 추가 데이터 (예: 텍스트)
          },
        ],
      });
      return response;
    } catch (error) {
      console.error('Error while inserting vector into Qdrant:', error);
      throw new Error('Failed to insert vector into Qdrant');
    }
  }
}
