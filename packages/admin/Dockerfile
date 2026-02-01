FROM node:22-slim AS deps

WORKDIR /app

# Copy all package files for yarn workspaces
COPY package.json yarn.lock ./
COPY packages/admin/package.json ./packages/admin/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/editor/package.json ./packages/editor/

# Install dependencies
RUN yarn install --frozen-lockfile

# Fix Rollup native bindings - yarn 1.x doesn't handle platform-specific optional deps correctly
RUN yarn add @rollup/rollup-linux-arm64-gnu --ignore-workspace-root-check

FROM node:22-slim

WORKDIR /app

# Copy source files first
COPY package.json yarn.lock ./
COPY packages/admin ./packages/admin

# Copy dependencies from deps stage (after source to avoid overwrite)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/admin/node_modules ./packages/admin/node_modules

WORKDIR /app/packages/admin

EXPOSE 3000

CMD ["yarn", "dev", "--host", "0.0.0.0"]
