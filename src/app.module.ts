import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfModule } from './pdf/pdf.module';
import { EmbeddingModule } from './embedding/embedding.module';

@Module({
  imports: [PdfModule, EmbeddingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
