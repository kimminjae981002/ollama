import { Module } from '@nestjs/common';
import { PdfParseController } from './pdf.controller';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Module({
  imports: [EmbeddingModule],
  providers: [EmbeddingService],
  controllers: [PdfParseController],
})
export class PdfModule {}
