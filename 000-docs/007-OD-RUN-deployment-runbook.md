# Deployment Runbook: lilly-75-holy

**Last Updated:** 2026-05-03

## First-time bootstrap on the Intent Solutions VPS

Run these once. After that, every push to `main` deploys via the GitHub Actions workflow.

### 1. Clone the repo on the VPS

```bash
ssh intentsolutions
sudo -iu intentsolutions
mkdir -p /srv && cd /srv
git clone https://github.com/jeremylongshore/lilly-75-holy.git
cd lilly-75-holy
```

### 2. Create the `.env` file

```bash
cat > .env <<EOF
SESSION_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
TZ=America/New_York
EOF
chmod 600 .env
```

### 3. Build and start the container

```bash
docker compose up -d --build
docker compose logs -f app   # ctrl-c when you see "ready"
```

The container binds to `127.0.0.1:3000`. It is not yet reachable from the public internet — that's the next step.

### 4. Cut over the Caddy block for `dixieroad.org`

Edit `/etc/caddy/Caddyfile` as root. Find the existing block:

```
dixieroad.org, www.dixieroad.org {
    @legal path /privacy.html /terms.html
    handle @legal {
        root * /var/www/dixieroad.org
        file_server
    }
    redir https://scorecardecho.com{uri} 301
}
```

Replace the `redir` line with `reverse_proxy 127.0.0.1:3000` so the block becomes:

```
dixieroad.org, www.dixieroad.org {
    @legal path /privacy.html /terms.html
    handle @legal {
        root * /var/www/dixieroad.org
        file_server
    }
    reverse_proxy 127.0.0.1:3000
}
```

Validate before reloading:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy   # NEVER restart — it would kill 24 prod containers
```

### 5. Smoke test

```bash
curl -fsS https://dixieroad.org/api/healthz
# expect: {"ok":true,"ts":"..."}
```

### 6. Generate invite codes

```bash
docker compose exec app node -e 'console.log("use the helper container instead")'
# OR run on the host with the volume mounted (one-off):
docker run --rm \
  -v lilly-75-holy_holy-data:/data \
  -e DATABASE_PATH=/data/holy.db \
  -e SESSION_SECRET=anything-for-cli \
  --workdir /app \
  lilly-75-holy:latest \
  node /app/scripts/generate-invite-code.js --user "Lilly Grace"
```

> Note: simpler is to run it on the dev box with `DATABASE_PATH` pointing at a copy, then ship the row. For v1, the easiest path is:
> ```
> docker compose exec app sh -c 'cd /app && tsx scripts/generate-invite-code.ts --user "Lilly Grace"'
> ```
> if `tsx` is included in the runtime image. (For v1 we prebake it via `pnpm dlx tsx`.)

## Ongoing — automated deploys

After the bootstrap, every push to `main` runs `.github/workflows/deploy.yml`:

1. Checkout
2. Connect to the tailnet via Tailscale OIDC
3. SSH to the VPS using `DEPLOY_SSH_KEY`
4. `git reset --hard origin/main && docker compose up -d --build`
5. `curl https://dixieroad.org/api/healthz` smoke test (5 retries)

### Required GitHub repo secrets

| Secret | Source |
|---|---|
| `TS_OAUTH_CLIENT_ID` | Tailscale admin → OAuth clients (tag `tag:ci`) |
| `TS_OAUTH_SECRET` | same |
| `DEPLOY_HOST` | `intentsolutions` (or its tailnet IP `100.88.144.55`) |
| `DEPLOY_USER` | `intentsolutions` |
| `DEPLOY_SSH_KEY` | An ed25519 private key whose public key is in the VPS's `~intentsolutions/.ssh/authorized_keys` |

Set with:
```bash
gh secret set TS_OAUTH_CLIENT_ID --repo jeremylongshore/lilly-75-holy
gh secret set TS_OAUTH_SECRET --repo jeremylongshore/lilly-75-holy
gh secret set DEPLOY_HOST --repo jeremylongshore/lilly-75-holy
gh secret set DEPLOY_USER --repo jeremylongshore/lilly-75-holy
gh secret set DEPLOY_SSH_KEY --repo jeremylongshore/lilly-75-holy < ~/.ssh/lilly-75-holy-deploy
```

## Rollback

```bash
ssh intentsolutions
cd /srv/lilly-75-holy
git log --oneline -10           # pick the previous good commit
git reset --hard <sha>
docker compose up -d --build
```

The SQLite DB is a Docker volume; rollback does not touch user data.

## Backup

The volume `lilly-75-holy_holy-data` is picked up by the existing Borg config (`/etc/borg/`), nightly. Restore via the standard runbook in `~/000-projects/intentsolutions-vps-runbook/docs/RESTORE.md`.

## Things NOT to do

- **Never `caddy restart`** — only `caddy validate && systemctl reload caddy`.
- **Never `docker restart`** the daemon on this VPS — kills 24 prod containers.
- **Never edit the SQLite DB by hand** unless you have a fresh backup.
- **Never commit `.env`, `data/`, or `*.db*`** — `.gitignore` covers all three; CI will reject if anything slips.
