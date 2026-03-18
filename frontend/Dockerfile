# frontend/Dockerfile

# Usa uma versão leve do Node.js
FROM node:18-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração do NPM e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código do frontend
COPY . .

# Roda o comando do Vite para gerar a versão otimizada ("minificada") do site
RUN npm run build

# Instala um servidor estático simples e rápido para servir os arquivos do React
RUN npm install -g serve

# Expõe a porta que configuramos no docker-compose e no Nginx
EXPOSE 3000

# Roda o servidor apontando para a pasta 'dist' gerada pelo Vite
CMD ["serve", "-s", "dist", "-l", "3000"]