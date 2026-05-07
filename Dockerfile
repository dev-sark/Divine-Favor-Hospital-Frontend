# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy built assets and necessary files
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.ts ./

EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
