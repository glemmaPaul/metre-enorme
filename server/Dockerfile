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
RUN yarn build &> /dev/null

# Expose the port
EXPOSE 4000

# Set default command
CMD ["yarn", "prod:server"]