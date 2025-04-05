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
  @UseInterceptors(FileInterceptor('file')) // 'file' 필드에 PDF 파일 업로드
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const pdfBuffer = file.buffer;

    // PDF에서 텍스트 추출
    const data = await pdf(pdfBuffer);
    const extractedText = data.text;

    // 텍스트 임베딩 생성
    const embedding =
      await this.embeddingService.generateEmbedding(extractedText);

    // Qdrant에 test라는 컬렉션으로 데이터 저장
    const qdrantResponse = await this.qdrantService.upsertVector(
      'test',
      embedding,
      Date.now(),
      {
        text: extractedText,
      },
    );

    return { success: true, qdrantResponse };
  }
}
