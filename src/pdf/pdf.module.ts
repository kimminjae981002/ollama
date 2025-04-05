import { Module } from '@nestjs/common';
import { PdfParseController } from './pdf.controller';

@Module({
  controllers: [PdfParseController],
})
export class PdfModule {}
