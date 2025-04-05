import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { OllamaController } from './ollama.controller';
import { QdrantModule } from 'src/qdrant/qdrant.module';
import { EmbeddingService } from './embedding.service';

@Module({
  imports: [QdrantModule],
  providers: [OllamaService, EmbeddingService],
  controllers: [OllamaController],
  exports: [OllamaService, EmbeddingService],
})
export class OllamaModule {}
