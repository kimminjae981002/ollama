import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfModule } from './pdf/pdf.module';
import { OllamaModule } from './ollama/ollama.module';
import { QdrantModule } from './qdrant/qdrant.module';

@Module({
  imports: [PdfModule, QdrantModule, OllamaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
