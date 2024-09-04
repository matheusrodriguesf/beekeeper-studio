FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
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
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN chown -R node:node /app

USER node

RUN yarn install && npx electron-rebuild

USER root
RUN chmod 4755 /app/node_modules/electron/dist/chrome-sandbox

USER node

CMD ["yarn", "run", "electron:serve", "--no-sandbox"]