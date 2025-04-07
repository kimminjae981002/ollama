import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as pdf from 'pdf-parse';
import { Express } from 'express';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { EmbeddingService } from 'src/ollama/embedding.service';

@Controller('pdf/parse')
export class PdfParseController {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    try {
      const pdfBuffer = file.buffer;
      const data = await pdf(pdfBuffer);
      const extractedText = data.text;
      console.log(extractedText, 'test');
      const chunks = this.splitTextIntoChunks(extractedText);
      console.log(`PDF가 ${chunks.length}개 청크로 분할되었습니다.`);

      const results: any = [];

      // Promise.all 대신 순차 처리로 변경
      for (let i = 0; i < chunks.length; i++) {
        try {
          const chunk = chunks[i];
          console.log(`청크 ${i + 1}/${chunks.length} 처리 중...`);

          // 임베딩 생성
          const embedding =
            await this.embeddingService.generateEmbedding(chunk);
          console.log(
            `청크 ${i + 1} 임베딩 생성 완료: ${embedding.length} 차원`,
          );

          // 고유 ID 생성 (타임스탬프 + UUID 조합)
          const id = Date.now() * 1000 + i;

          // Qdrant에 저장
          await this.qdrantService.upsertVector('test', embedding, id, {
            text: chunk,
            chunkIndex: i,
            totalChunks: chunks.length,
            source: file.originalname || 'unknown',
          });

          console.log(`청크 ${i + 1} Qdrant 저장 완료 (ID: ${id})`);
          results.push({ id, chunkIndex: i });
        } catch (chunkError) {
          console.error(`청크 ${i + 1} 처리 중 오류:`, chunkError);
          // 개별 청크 오류는 건너뛰고 계속 진행
        }
      }

      return {
        success: true,
        message: `PDF 문서가 성공적으로 처리되어 ${results.length}/${chunks.length}개 청크가 저장되었습니다.`,
        chunks: results,
      };
    } catch (error) {
      console.error('PDF 처리 중 오류:', error);
      throw new Error(`PDF 처리 실패: ${error.message}`);
    }
  }

  // 텍스트를 청크로 분할하는 함수
  private splitTextIntoChunks(
    text: string,
    chunkSize = 1000,
    overlap = 200,
  ): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + chunkSize, text.length);

      // 가능하면 문장 끝에서 청크 분할
      if (endIndex < text.length) {
        const nextPeriod = text.indexOf('.', endIndex - overlap);
        if (nextPeriod !== -1 && nextPeriod < endIndex + 100) {
          // 너무 멀지 않은 다음 마침표 위치
          endIndex = nextPeriod + 1;
        }
      }

      chunks.push(text.substring(startIndex, endIndex));
      startIndex =
        endIndex - overlap > startIndex ? endIndex - overlap : endIndex;
    }

    return chunks;
  }
}
