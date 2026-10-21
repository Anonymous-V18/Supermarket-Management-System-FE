# ==========================================
# Stage 1: Build Angular SSR using Node 22 Alpine
# ==========================================
FROM node:22-alpine AS build
WORKDIR /app

# Cache npm dependencies layer
COPY package*.json ./
RUN npm ci

# Copy source code and compile SSR and browser bundles
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Minimal Runtime SSR Runner using Node 22 Alpine
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts || true

# Copy compiled dist folder with ownership
COPY --from=build --chown=node:node /app/dist ./dist

# Best Practice: Run as unprivileged node user
USER node

EXPOSE 4000

# Healthcheck to verify SSR server responsiveness
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/ || exit 1

CMD ["node", "dist/supermarket-management-system-fe/server/server.mjs"]
