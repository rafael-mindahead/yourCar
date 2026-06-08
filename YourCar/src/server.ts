import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pool from './database/connections'; // conexao importada
import {Car} from  './models/Car';
import { Option } from './models/Option'; 
import { GeminiService } from './services/geminiService'; 

// carrega as variaveis de ambiente (porta, dados do banco)
dotenv.config();
console.log("--- DEBUG DE CONEXÃO ---");
console.log("Banco de dados:", process.env.DB_NAME);
console.log("Host do DB:", process.env.DB_HOST);
console.log("------------------------");

const app = express();
const PORT  = process.env.PORT || 3000;
 

// middleware essencial de segurnça e formataçâo
// ele garante que o nosso backkend so aceite e entenda dados no formato json
// rota 1
app.use(cors({
    origin: 'http://localhost:5173', // Restringe a origem ao frontend React para maior segurança
    methods: ['GET', 'POST'], // Apenas os métodos necessários para a aplicação
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

interface CarModelRow {
    id: number;
    name: string;
    base_price: string;
}

interface CarOptionRow {
    id: number;
    category: string;
    name: string;
    additional_price: string;
}

//  rota de teste que garante  que o serviodr esta vivo
app.get('/', (req: Request, res: Response) => { 
    res.json({
        Message: 'servidor da YourCar rodando perfeitamente',
        status: 'online'
    });
});
// Rota para listar todas as opções de peças
app.get('/opcoes', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM car_options');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar opções no banco:', error);
        res.status(500).json({ erro: 'Erro ao buscar opções no banco.' });
    }
});
// rota 2 
app.get('/carros', async(req: Request, res: Response) => {
    try {
        // faz o select no banco e espera a resposta
        const [rows] = await pool.query('SELECT * FROM car_models');

        // devolve os dados dos carros em formato de json 
        res.json(rows);
    } catch(error) {
        console.error('erro: ao conectar ao banco de dados:', error);
        res.status(500).json({erro: 'erro interno no servidor de banco'})
    }
});
// A rota principal god save us
app.post('/configurar', async(req: Request, res: Response): Promise<void> => {
    try {
        // recebemos os id que o usuario escolheu
        const {modelId, pneuId, bancoId, corId} = req.body;

        // Validação estrita de entrada: garantir que todos os IDs sejam inteiros positivos
        if (
            typeof modelId !== 'number' || modelId <= 0 || !Number.isInteger(modelId) ||
            typeof pneuId !== 'number' || pneuId <= 0 || !Number.isInteger(pneuId) ||
            typeof bancoId !== 'number' || bancoId <= 0 || !Number.isInteger(bancoId) ||
            typeof corId !== 'number' || corId <= 0 || !Number.isInteger(corId)
        ) {
            res.status(400).json({erro: 'Entrada inválida. Todos os IDs de configuração do veículo devem ser números inteiros positivos.'});
            return;
        }

        //buscamos as informaçOes reais de cada peça no banco de dados 
        const [modelRows]: any = await pool.query('SELECT * FROM car_models WHERE id = ?', [modelId]);
        const [pneuRows]: any = await pool.query('SELECT * FROM car_options WHERE id = ?', [pneuId]);
        const [bancoRows]: any = await pool.query('SELECT * FROM car_options WHERE id = ?', [bancoId]);
        const [corRows]: any = await pool.query('SELECT * FROM car_options WHERE id = ?',[corId]);
        
        const modelData = modelRows as CarModelRow[];
        const pneuData = pneuRows as CarOptionRow[];
        const bancoData = bancoRows as CarOptionRow[];
        const corData = corRows as CarOptionRow[];

        // barrando se alguma info nao existir
        if (!modelData[0] || !pneuData[0] || !bancoData[0] || !corData[0] ) {
            res.status(400).json({erro: 'uma ou mais peças não foram encontradas'})
            return;
        }
        // aplicando a poo instanciando as classes com os dados do banco de dados 
        const pneu = new Option(pneuData[0].id, pneuData[0].category, pneuData[0].name, Number(pneuData[0].additional_price));
        const banco = new Option(bancoData[0].id, bancoData[0].category, bancoData[0].name, Number(bancoData[0].additional_price));
        const cor = new Option(corData[0].id, corData[0].category, corData[0].name, Number(corData[0].additional_price));
        
        const car = new Car(modelData[0].name, Number(modelData[0].base_price), pneu, banco, cor);
        
        // calculando o valor total, chamando a descrição de IA e gerando a imagem de IA
        const totalPrice = car.calculateTotal();
        const geminiService = GeminiService.getInstance();
        const description = await geminiService.generateCarDescription(car);
        const imageBase64 = await geminiService.generateCarImage(car);

        // salvando a config final na table user-configurations
        await pool.query(
            `INSERT INTO user_configurations 
            (model_id, pneu_option_id, banco_option_id, cor_option_id, total_price, gemini_description) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [modelId, pneuId, bancoId, corId, totalPrice, description]
        );

        // respondendo o user com o texto e imagem em base64 codificada
        res.json({
            mensagem: 'Carro configurado com sucesso! 🚗',
            precoTotal: totalPrice,
            descricaoIA: description,
            imagemIA: imageBase64
        });

    } catch (error) {
        console.error('Erro na configuração:', error);
        res.status(500).json({ erro: 'Erro interno ao tentar configurar o carro.' });
    }
});
// iniciando o servidor 
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`); 
});