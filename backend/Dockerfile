# backend/Dockerfile

# Usa uma versão leve e oficial do Python
FROM python:3.11-slim

# Define a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copia apenas o arquivo de dependências primeiro (isso deixa o "build" do Docker muito mais rápido nas próximas vezes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instala o Gunicorn (servidor de produção essencial para Django)
RUN pip install gunicorn

# Copia todo o restante do código da pasta backend para dentro do contêiner
COPY . .

# Expõe a porta que o Gunicorn vai usar
EXPOSE 8000

# Comando final que liga a aplicação
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "TCC_DjangoScrumKipo.wsgi:application"]