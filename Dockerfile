# Usa uma imagem oficial do Node.js estável
FROM node:20-alpine

# Cria o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de configuração de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos do projeto (incluindo a pasta yourcar)
COPY . .

# Expõe a porta que o Express vai rodar
EXPOSE 3000

# Comando para rodar o projeto em modo de desenvolvimento
CMD ["npm", "run", "dev"]