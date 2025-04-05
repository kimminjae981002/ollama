import { OllamaService } from './ollama.service';
import { Controller, Post, Query } from '@nestjs/common';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}
  @Post()
  async search(@Query('question') question: string) {
    return await this.ollamaService.search(question);
  }
}
