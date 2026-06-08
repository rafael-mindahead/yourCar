import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CarModel { id: number; name: string; base_price: string; }
interface CarOption { id: number; category: string; name: string; additional_price: string; }

function App() {
  const [modelos, setModelos] = useState<CarModel[]>([]);
  const [opcoes, setOpcoes] = useState<CarOption[]>([]);
  
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedPneu, setSelectedPneu] = useState<CarOption | null>(null);
  const [selectedBanco, setSelectedBanco] = useState<CarOption | null>(null);
  const [selectedCor, setSelectedCor] = useState<CarOption | null>(null);

  const [loadingIA, setLoadingIA] = useState(false);
  const [descricaoIA, setDescricaoIA] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imagemIA, setImagemIA] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/carros').then(res => res.json()),
      fetch('http://localhost:3000/opcoes').then(res => res.json())
    ])
    .then(([carrosData, opcoesData]) => {
      const carrosUnicos = Array.from(new Map(carrosData.map((item: any) => [item.name, item])).values());
      setModelos(carrosUnicos as CarModel[]);
      setOpcoes(opcoesData);
    })
    .catch(erro => console.error("Erro na busca:", erro));
  }, []);

  const pneus = opcoes.filter(op => op.category === 'pneu');
  const bancos = opcoes.filter(op => op.category === 'banco');
  const cores = opcoes.filter(op => op.category === 'cor_carro');

  const precoTotal = () => {
    let total = 0;
    if (selectedModel) total += Number(selectedModel.base_price);
    if (selectedPneu) total += Number(selectedPneu.additional_price);
    if (selectedBanco) total += Number(selectedBanco.additional_price);
    if (selectedCor) total += Number(selectedCor.additional_price);
    return total;
  };

  const finalizarConfiguracao = async () => {
    if (!selectedModel || !selectedPneu || !selectedBanco || !selectedCor) {
      alert('Selecione todas as opções!');
      return;
    }

    setLoadingIA(true);
    setDescricaoIA(null);
    setImageError(false);

    try {
      const resposta = await fetch('http://localhost:3000/configurar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModel.id, 
          pneuId: selectedPneu.id, 
          bancoId: selectedBanco.id, 
          corId: selectedCor.id
        })
      });

      // Se a resposta do servidor não for 200 (sucesso), jogamos um erro manualmente
      if (!resposta.ok) {
        throw new Error('Erro no servidor');
      }

      const dados = await resposta.json();
      setDescricaoIA(dados.descricaoIA);
      setImagemIA(dados.imagemIA);
    } catch (error) {
      console.error('Erro na chamada:', error);
      alert('Ops! Ocorreu um erro ao processar. Verifique os logs do servidor.');
    } finally {
      setLoadingIA(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col selection:bg-cyan-500/30">
      <header className="bg-black/80 backdrop-blur-md py-4 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
            SEUCARRO
          </h1>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Total</p>
            <motion.p 
              key={precoTotal()} 
              initial={{ scale: 1.2, color: '#fff' }} 
              animate={{ scale: 1, color: '#4ade80' }} 
              className="text-2xl font-bold"
            >
              R$ {precoTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </motion.p>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-2 space-y-6">
          
          <motion.section variants={itemVariants} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">1. Modelo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modelos.map((modelo) => (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={modelo.id} onClick={() => setSelectedModel(modelo)}
                  className={`p-4 rounded-xl text-left transition-all border ${selectedModel?.id === modelo.id ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                  <p className="text-lg font-bold">{modelo.name}</p>
                  <p className="text-cyan-400 text-sm">R$ {Number(modelo.base_price).toLocaleString('pt-BR')}</p>
                </motion.button>
              ))}
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">2. Cor Externa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cores.map((cor) => (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={cor.id} onClick={() => setSelectedCor(cor)}
                  className={`p-4 rounded-xl text-left transition-all border ${selectedCor?.id === cor.id ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                  <p className="font-bold">{cor.name}</p>
                  <p className="text-cyan-400 text-sm">+ R$ {Number(cor.additional_price).toLocaleString('pt-BR')}</p>
                </motion.button>
              ))}
            </div>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.section variants={itemVariants} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">3. Rodas</h2>
              <div className="flex flex-col gap-3">
                {pneus.map((pneu) => (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={pneu.id} onClick={() => setSelectedPneu(pneu)}
                    className={`p-3 rounded-xl text-left transition-all border ${selectedPneu?.id === pneu.id ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                    <p className="font-bold">{pneu.name}</p>
                    <p className="text-cyan-400 text-sm">+ R$ {Number(pneu.additional_price).toLocaleString('pt-BR')}</p>
                  </motion.button>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4">4. Interior</h2>
              <div className="flex flex-col gap-3">
                {bancos.map((banco) => (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={banco.id} onClick={() => setSelectedBanco(banco)}
                    className={`p-3 rounded-xl text-left transition-all border ${selectedBanco?.id === banco.id ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}>
                    <p className="font-bold">{banco.name}</p>
                    <p className="text-cyan-400 text-sm">+ R$ {Number(banco.additional_price).toLocaleString('pt-BR')}</p>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-1">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-center border-b border-gray-800 pb-4">Sua Máquina</h2>
            
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex justify-between border-b border-gray-800/50 pb-2">
                <span className="text-gray-500">Modelo</span> <span className="font-semibold">{selectedModel ? selectedModel.name : '---'}</span>
              </li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2">
                <span className="text-gray-500">Cor</span> <span className="font-semibold">{selectedCor ? selectedCor.name : '---'}</span>
              </li>
              <li className="flex justify-between border-b border-gray-800/50 pb-2">
                <span className="text-gray-500">Rodas</span> <span className="font-semibold">{selectedPneu ? selectedPneu.name : '---'}</span>
              </li>
              <li className="flex justify-between pb-2">
                <span className="text-gray-500">Interior</span> <span className="font-semibold">{selectedBanco ? selectedBanco.name : '---'}</span>
              </li>
            </ul>

            <motion.button 
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={finalizarConfiguracao} disabled={loadingIA}
              className={`w-full py-4 rounded-xl font-black tracking-widest text-sm uppercase transition-all shadow-lg flex justify-center items-center gap-2 ${
                loadingIA ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              }`}
            >
              {loadingIA ? (
                <span className="animate-pulse">Consultando IA...</span>
              ) : (
                <>Finalizar <span className="text-lg">✨</span></>
              )}
            </motion.button>
              {/* Resultado do Gemini + Imagem Gerada */}
            {descricaoIA && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-5 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-cyan-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-cyan-400 text-xl">✨</span>
                  <h3 className="font-bold text-cyan-400">Máquina Configurada:</h3>
                </div>

                {/* A Mágica da Imagem Gratuita Aqui! */}
                <img 
                  src={(!imagemIA || imagemIA === "fallback" || imageError)
                    ? `https://loremflickr.com/800/400/car,${selectedModel ? selectedModel.name.split(' ')[0].toLowerCase() : 'luxury'}`
                    : `data:image/png;base64,${imagemIA}`
                  } 
                  onError={() => setImageError(true)}
                  alt="Carro gerado por IA" 
                  className="w-full h-64 object-cover rounded-lg mb-4 shadow-2xl border border-gray-700"
                />

                <p className="text-sm text-gray-300 leading-relaxed italic">"{descricaoIA}"</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;