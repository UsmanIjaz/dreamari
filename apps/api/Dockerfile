# Dreamari API image. Build context = repo root (so the pnpm workspace is available).
FROM node:20-slim

# Prisma needs openssl; ca-certificates for outbound TLS.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# pnpm (pinned to match the lockfile)
RUN npm install -g pnpm@10.30.3

WORKDIR /app
COPY . .

# install the workspace + generate the Prisma client (no DB needed at build)
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @dreamari/api run db:generate

ENV NODE_ENV=production
EXPOSE 8080

# at runtime (DB reachable): sync the schema, seed (idempotent, non-fatal), then start
CMD ["sh", "-c", "pnpm --filter @dreamari/api run db:push && { pnpm --filter @dreamari/api run db:seed || echo 'seed skipped (non-fatal)'; } && pnpm --filter @dreamari/api start"]
