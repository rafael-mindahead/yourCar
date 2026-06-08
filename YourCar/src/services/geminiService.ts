import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Car } from '../models/Car';

dotenv.config();

export class GeminiService {
  private static instance: GeminiService;
  private apiKey: string;
  private ai: GoogleGenerativeAI | null = null;

  private constructor() {
    this.apiKey = process.env.GEMINI_API_KEY as string;
    if (this.apiKey) {
      this.ai = new GoogleGenerativeAI(this.apiKey);
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async generateCarDescription(car: Car): Promise<string> {
    try {
      if (!this.ai) throw new Error("Sem API Key do Gemini configurada.");
      
      const model = this.ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Descreva este carro de luxo: ${car.modelName}, com rodas ${car.pneu.name} e interior em ${car.banco.name}. Cor: ${car.cor.name}. Seja entusiasmado e profissional.`;
      
      const result = await model.generateContent(prompt);
      return result.response.text();

    } catch (error) {
      console.error('Erro na chamada do Gemini:', error);
      console.log('IA falhou ou indisponível, usando fallback local...');
      return `O ${car.modelName} é uma obra-prima da engenharia. Equipado com as exclusivas rodas ${car.pneu.name} e um interior refinado em ${car.banco.name}, ele oferece uma experiência de condução incomparável. A pintura ${car.cor.name} completa o visual imponente desta configuração premium.`;
    }
  }

  public async generateCarImage(car: Car): Promise<string> {
    try {
      if (!this.apiKey) throw new Error("Sem API Key do Gemini configurada.");

      const prompt = `Fotografia cinematografica de um carro ${car.modelName} na cor ${car.cor.name} em um estudio escuro com iluminacao neon azul 8k realista.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [
            { prompt: prompt }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9"
          }
        })
      });

      if (!response.ok) {
        const errData: any = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Erro HTTP ${response.status}`);
      }

      const data: any = await response.json();
      const base64Image = data?.predictions?.[0]?.bytesBase64Encoded;
      if (!base64Image) {
        throw new Error("Nenhuma imagem retornada na resposta da API");
      }
      return base64Image;

    } catch (error: any) {
      console.error('Erro na chamada do Imagen:', error.message || error);
      console.log('IA falhou ou indisponível, usando fallback local para a imagem...');
      return "fallback";
    }
  }
}