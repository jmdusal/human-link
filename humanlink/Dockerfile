FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

EXPOSE 5173

# Standard Vite dev command
CMD ["npm", "run", "dev", "--", "--host"]