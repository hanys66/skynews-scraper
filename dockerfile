# Use official Node.js base image
FROM mcr.microsoft.com/playwright:v1.42.0-focal

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including Playwright
RUN npm install && npx playwright install --with-deps

# Copy the rest of the application
COPY . .

# Expose port 3000 for the Express server
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
