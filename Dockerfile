FROM ubuntu:22.04

# Instalação de pacotes necessários
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    git \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxtst6 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    libdrm2 \
    libgbm-dev \
    python-is-python3 \
    build-essential \
    --no-install-suggests --no-install-recommends && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalação do Yarn
RUN npm install -g yarn

# Criação do usuário node
RUN useradd -ms /bin/bash node

# Definição do diretório de trabalho
WORKDIR /app

# Copia os arquivos da aplicação
COPY . .

# Ajusta as permissões dos arquivos
RUN chown -R node:node /app

# Troca para o usuário node
USER node

# Instalação das dependências da aplicação
RUN yarn install && \
    npx electron-rebuild

# Ajusta as permissões do sandbox do Electron
USER root
RUN chown root /app/node_modules/electron/dist/chrome-sandbox && \
    chmod 4755 /app/node_modules/electron/dist/chrome-sandbox

# Troca de volta para o usuário node
USER node

# Comando para iniciar a aplicação
CMD ["yarn", "run", "electron:serve", "--no-sandbox"]