FROM node:20-bookworm

# Install Chromium and FFmpeg required by Remotion
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libasound2 \
    libxss1 \
    libxrandr2 \
    libxtst6 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Tell Remotion/Puppeteer where Chromium is
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript and Build Remotion Bundle beforehand!
# This uses the 8GB RAM build server instead of the 512MB RAM live server.
RUN npx tsc
RUN npx ts-node build.ts

EXPOSE 8080

# Restrict Node to 200MB RAM to ensure FFmpeg and Chromium have the remaining 300MB
# on the 512MB free tier constraint!
CMD ["node", "--max-old-space-size=200", "dist/server.js"]
