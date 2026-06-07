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
    origin: '*', // Permite tudo, ideal para desenvolvimento
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Garante que o POST está liberado
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

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
        res.status(500).json({ erro: 'Erro ao buscar opções no banco.' });
    }
});
// rota 2 
app.get('/carros', async(req: Request, res: Response) =>{
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
        

        //buscamos as informaçOes reais de cada peça no banco de dados 
        const [modelData]: any = await pool.query('SELECT * FROM car_models WHERE id = ?', [modelId]);
        const [pneuData]: any = await pool.query('SELECT * FROM car_options WHERE id = ?', [pneuId]);
        const [bancoData]: any = await pool.query('SELECT * FROM car_options WHERE id = ?', [bancoId]);
        const [corData]: any = await pool.query('SELECT * FROM car_options WHERE id = ?',[corId]);
        
        // barrando se alguma info nao existir
        if (!modelData[0] || !pneuData[0]|| !bancoData[0] || !corData[0] ) {
            res.status(400).json({erro: 'uma ou mais peças nao froma encontradas'})
            return;
        }
        // aplçicando a poo instanciando as classes com os dados do banco de dados 
        const pneu = new Option(pneuData[0].id, pneuData[0].category, pneuData[0].name, Number(pneuData[0].additional_price));
        const banco = new Option(bancoData[0].id, bancoData[0].category, bancoData[0].name, Number(bancoData[0].additional_price));
        const cor = new Option(corData[0].id, corData[0].category, corData[0].name, Number(corData[0].additional_price));
        
        const car = new Car(modelData[0].name, Number(modelData[0].base_price), pneu, banco, cor);
        
        // calculando o valor total e chamando o gemi
        const totalPrice = car.calculateTotal();
        const description = await GeminiService.generateCarDescription(car);

        // salvando a config final na table user-configurantions
        await pool.query(
            `INSERT INTO user_configurations 
            (model_id, pneu_option_id, banco_option_id, cor_option_id, total_price, gemini_description) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [modelId, pneuId, bancoId, corId, totalPrice, description]
        );

        // respondendo o user
        res.json({
            mensagem: 'Carro configurado com sucesso! 🚗',
            precoTotal: totalPrice,
            descricaoIA: description
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