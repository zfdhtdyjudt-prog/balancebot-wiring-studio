FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates xz-utils python3 \
  && curl -fsSL https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz \
     | tar -xz -C /usr/local/bin arduino-cli \
  && arduino-cli config init --overwrite \
  && arduino-cli core update-index \
  && arduino-cli core install arduino:avr \
  && apt-get purge -y curl xz-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json server.mjs ./
ENV PORT=8787
EXPOSE 8787
CMD ["node", "server.mjs"]
