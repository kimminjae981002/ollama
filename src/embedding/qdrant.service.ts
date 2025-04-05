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
      // Qdrant URL 사용
      const client = new QdrantClient({ url: 'http://127.0.0.1:6333' });

      // 컬렉션 만들기
      await client.createCollection(collectionName, {
        vectors: {
          size: vector.length, // 임베딩 차원 수로 지정
          distance: 'Cosine',
        },
      });

      // Qdrant 컬렉션에 데이터 저장
      const response = await client.upsert(collectionName, {
        points: [
          {
            id, // 고유 ID
            vector, // 벡터 데이터
            payload, // 텍스트 데이터
          },
        ],
      });

      return response;
    } catch (error) {
      console.error('Qdrant 데이터 저장 에러:', error);
      throw new Error('Qdrant 데이터 저장 실패');
    }
  }
}
