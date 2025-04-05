import { Module } from '@nestjs/common';
import { PdfParseController } from './pdf.controller';
import { QdrantModule } from 'src/qdrant/qdrant.module';
import { OllamaModule } from 'src/ollama/ollama.module';

@Module({
  imports: [QdrantModule, OllamaModule],
  controllers: [PdfParseController],
})
export class PdfModule {}
