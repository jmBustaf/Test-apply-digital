# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["dumb-init", "npm", "run", "start:dev"]

# Production stage
FROM base AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application from development stage
COPY --from=development --chown=nestjs:nodejs /app/dist ./dist
COPY --from=development --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=development --chown=nestjs:nodejs /app/package*.json ./
COPY --from=development --chown=nestjs:nodejs /app/tsconfig*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["dumb-init", "node", "dist/src/main.js"]
