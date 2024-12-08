FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Build the server, I am a lazy boy and tsc sucks balls
RUN yarn build-silent

# Expose the port
EXPOSE 4000

# Expose env ROOT_DIR for compentencies images
ENV ROOT_DIR /app

# Set default command
CMD ["node", "dist/index.js"]