import {Option} from './Option';
 export class Car {
    private modelName:string;
    private basePrice: number;
    private pneu: Option;
    private banco: Option;
    private cor: Option;

    constructor(modelName: string, basePrice: number, pneu: Option, banco: Option, cor: Option) {
        this.modelName = modelName;
        this.basePrice = basePrice;
        this.pneu = pneu;
        this.banco = banco;
        this.cor = cor;
    }
    // metodo encapsulado para calcular o preco total
    public calculateTotal(): number {
        return Number(this.basePrice) +
        Number(this.pneu.additional_price) +
        Number(this.banco.additional_price) +
        Number(this.cor.additional_price);
    }
    //metodo que vai preparar o terreno para a api do gemini ai depois
    public generateGeminiPrompt(): string {
        return `Descreva em um parágrafo comercial um carro modelo ${this.modelName}, com cor ${this.cor.name}, equipado com ${this.pneu.name} e interior em ${this.banco.name}.`;        
    }
 }