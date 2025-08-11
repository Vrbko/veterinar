# Step 1: Use an official Node.js LTS image
FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json first (better layer caching)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm ci --only=production

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Expose the port your Express.js app runs on
EXPOSE 3000

# Step 7: Set environment variables (optional - can also be in docker-compose.yml)
ENV NODE_ENV=production \
    DB_HOST=mysql \
    DB_USER=root \
    DB_PASSWORD=secret \
    DB_NAME=mydb

# Step 8: Start the app
CMD ["node", "server.js"]