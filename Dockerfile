# Use the official Node.js image.
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy root monorepo metadata
COPY package*.json ./
COPY tsconfig.json ./

# Copy ALL workspaces (required for npm workspaces resolving)
# We copy everything in packages and services to ensure build context is complete
COPY packages/ ./packages/
COPY services/ ./services/

# Install dependencies for the entire monorepo
# This resolves local @jhos/* packages
RUN npm install

# Build the projects (shared first, then api)
RUN npm run build --workspace=@jhos/shared
RUN npm run build --workspace=@jhos/prompts
RUN npm run build --workspace=@jhos/api

# Expose the port (Cloud Run defaults to 8080)
EXPOSE 8080

# Run the web service on container startup.
CMD [ "npm", "start", "--workspace=@jhos/api" ]
