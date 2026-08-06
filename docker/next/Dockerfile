FROM node:23-slim

WORKDIR /app

# Workerd用の依存パッケージをインストール
RUN apt-get update && apt-get install -y \
    libc++1 \
    && rm -rf /var/lib/apt/lists/*

# package.jsonとpackage-lock.jsonをコピー
COPY ./next/package*.json ./

RUN npm install

