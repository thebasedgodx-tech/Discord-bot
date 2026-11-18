# Discord Music Bot

Muziek-stream bot voor Discord: `discord.js` v14 + `@discordjs/voice` + `play-dl` (yt-dlp/ffmpeg in de image).

## Commands

| Command | Wat het doet |
|---|---|
| `/play <query>` | YouTube-URL of zoekterm; voegt toe aan de queue en start playback |
| `/skip` | Slaat het huidige nummer over |
| `/stop` | Stopt playback en leegt de queue |
| `/queue` | Toont de wachtrij (max 15 zichtbaar) |
| `/leave` | Bot verlaat het voice channel |

## Vereisten

- Node.js 20+ (lokaal) of Docker (VPS)
- Een Discord application met bot token
- Voice-intent aan en de bot uitgenodigd met `bot` + `applications.commands` scopes

## 1. Bot aanmaken (Discord Developer Portal)

1. Ga naar https://discord.com/developers/applications → **New Application**.
2. **Bot** → **Reset Token** → kopieer het token (bewaar het veilig).
3. **Bot** → **Privileged Gateway Intents**: zet **Message Content Intent** aan (nodig voor deze setup).
4. **OAuth2 → URL Generator**: scopes `bot` + `applications.commands`; permissions: `Connect`, `Speak`, `Send Messages`, `Read Message History`, `Use Slash Commands`.
5. Open de gegenereerde URL en nodig de bot uit in je server.

## 2. Configuratie

Kopieer `.env.example` naar `.env` en vul in:

```
DISCORD_TOKEN=...        # verplicht
CLIENT_ID=...            # application id (verplicht voor command-registratie)
GUILD_ID=...             # optioneel: snelle dev-registratie in één server
```

## 3. Draaien op je VPS (Docker)

```bash
# op de VPS, in de repo-map
docker compose build
docker compose run --rm bot npm run deploy   # slash commands registreren
docker compose up -d
docker compose logs -f                       # logs volgen
```

Herstart na een update:

```bash
 git pull && docker compose build && docker compose up -d
```

Stoppen:

```bash
docker compose down
```

## 4. Lokaal draaien (zonder Docker)

```bash
npm install
npm run deploy
npm start
```

Lokaal heb je `ffmpeg` en `yt-dlp` op je PATH nodig (of gebruik de Docker-image).

## Troubleshooting

- **Bot joint wel, geen geluid**: check of `ffmpeg` in de container zit (`docker compose exec bot ffmpeg -version`) en of `libsodium-wrappers` geïnstalleerd is.
- **`/play` zegt niets gevonden**: YouTube blokkeert soms datacenter-IP's; probeer een andere zoekterm of update `play-dl`.
- **Commands verschijnen niet**: draai `npm run deploy` opnieuw; met `GUILD_ID` zijn ze direct zichtbaar, globaal kan het tot een uur duren.
- **Token gelekt**: reset het token in de Developer Portal en update `.env`.

## Let op

Streamen vanaf YouTube kan tegen de Terms of Service van YouTube/Discord zijn. Gebruik dit alleen op een server waar je de rechten hebt, of vervang `play-dl` door een bron met eigen licentie.
