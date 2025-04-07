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

      try {
        // 컬렉션이 존재하는지 확인
        await client.getCollection(collectionName);
        console.log(`컬렉션 ${collectionName} 이미 존재함`);
      } catch (collectionError) {
        // 컬렉션이 없으면 생성
        console.log(`컬렉션 ${collectionName} 생성 중...`);
        await client.createCollection(collectionName, {
          vectors: {
            size: vector.length,
            distance: 'Cosine',
          },
        });
        console.log(`컬렉션 ${collectionName} 생성 완료`);
      }

      // 데이터 저장
      console.log(`ID ${id}로 벡터 저장 중...`);
      const response = await client.upsert(collectionName, {
        points: [
          {
            id,
            vector,
            payload,
          },
        ],
      });

      console.log('upsert 응답:', response);
      return response;
    } catch (error) {
      console.error('Qdrant 데이터 저장 에러:', error);
      throw new Error(`Qdrant 데이터 저장 실패: ${error.message}`);
    }
  }

  // Qdrant 검색 기능 확장
  async searchVector(
    collectionName: string,
    vector: number[],
    options: { limit?: number; score_threshold?: number } = {},
  ) {
    const client = new QdrantClient({ url: 'http://127.0.0.1:6333' });

    const searchParams = {
      vector,
      with_payload: true,
      limit: options.limit || 3,
      score_threshold: options.score_threshold || 0.7, // 유사도 점수 임계값
      with_vectors: false, // 벡터는 필요없음
    };

    const response = await client.search(collectionName, searchParams);
    return response;
  }

  // QdrantService에 추가
  async createCollectionIfNotExists(
    collectionName: string,
    vectorSize: number,
  ) {
    const client = new QdrantClient({ url: 'http://127.0.0.1:6333' });

    try {
      await client.getCollection(collectionName);
      console.log(`컬렉션 ${collectionName} 이미 존재함`);
    } catch (e) {
      console.log(`컬렉션 ${collectionName} 생성 중...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine',
        },
      });
      console.log(`컬렉션 ${collectionName} 생성 완료`);
    }
  }
}
