import { EmbeddingService } from './../embedding/embedding.service';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as pdf from 'pdf-parse';
import { Express } from 'express';

@Controller('pdf/parse')
export class PdfParseController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' 필드에 PDF 파일 업로드
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const pdfBuffer = file.buffer;

    // PDF에서 텍스트 추출
    const data = await pdf(pdfBuffer);
    const extractedText = data.text;
    console.log(extractedText, 'test');
    // 텍스트 임베딩 생성
    const embedding =
      await this.embeddingService.generateEmbedding(extractedText);

    // // Qdrant에 벡터 저장
    // const qdrantResponse = await this.qdrantService.upsertVector('pdf_collection', embedding, Date.now(), {
    //     text: extractedText,
    // });

    return { success: true };
  }
}
