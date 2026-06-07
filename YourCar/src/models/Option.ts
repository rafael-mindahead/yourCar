export class Option {
    // no type, se declara o public ou private direto do construtor
    // ja cria os atributos automaticamnete
    constructor(
        public id: number,
        public category:string,
        public name:string,
        public additional_price: number
    ) {}
}