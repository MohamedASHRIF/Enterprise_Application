# Dockerfile for Next.js frontend (SSR) — builds and runs in production mode
FROM node:18-alpine as deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# If package-lock.json is present, `npm ci --production` is ideal. Many projects
# in this repo don't include package-lock.json, so use a compatible install that
# omits devDependencies instead.
RUN npm install --omit=dev --no-audit --no-fund
EXPOSE 3000
CMD ["npm","start"]
