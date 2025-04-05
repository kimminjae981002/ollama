import { Module } from '@nestjs/common';
import { PdfParseController } from './pdf.controller';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { QdrantService } from 'src/embedding/qdrant.service';

@Module({
  imports: [EmbeddingModule],
  providers: [EmbeddingService, QdrantService],
  controllers: [PdfParseController],
})
export class PdfModule {}
