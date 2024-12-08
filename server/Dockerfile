FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  gconf-service \
  libnss3 \
  libxss1 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libxshmfence1 \
  wget \
  gnupg \
  ca-certificates \
  fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

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