ARG NODE_IMAGE=public.ecr.aws/docker/library/node:24-alpine
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm test && npm run build
FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production PORT=3100
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared
USER node
EXPOSE 3100
CMD ["npm","start"]
