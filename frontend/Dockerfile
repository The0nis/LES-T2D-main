FROM node:21-alpine AS base

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000

EXPOSE 3000

