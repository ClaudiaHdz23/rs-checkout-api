# BUILD FOR LOCAL DEVELOPMENT #
FROM node:18-alpine As development

# Create app directory
WORKDIR /app

# Copy application dependency manifests to the container image
COPY --chown=node:node package*.json ./

# npm ci instead of npm install because it is faster and installs 
# exactly the dependencies and their versions specified in the package-lock.json file.
# designed for use in production and continuous integration/continuous delivery (CI/CD) environments.
RUN npm ci

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node


# BUILD FOR PRODUCTION #
FROM node:18-alpine As build

WORKDIR app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development app/node_modules ./node_modules
COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Ensures that only the production dependencies are installed.
RUN npm ci --only=production && npm cache clean --force


# PRODUCTION
FROM node:18-alpine As production

# Create app directory
WORKDIR /app

# Copy the bundled code from the build stage to the production image
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 4000

ENV PORT 4000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
