# wallet-tracker-api

Backend for tracking EVM wallets. You sign up with email and password or with your wallet (SIWE),
add your adresses and confirm them with signature. Then the API loads transactions from Etherscan,
Arbiscan and Optimistic Etherscan and makes stats for every wallet: volume, gas, active days and months,
which protocols and bridges were used. From the stats it counts points, and there is a leaderboard.
zkSync and Starknet have no explorer API here, so activity for them is added by hand.

## Running the Project

```
docker compose up -d          # postgres 15 on port 5432
cp .env.example .env          # fill in db config and jwt secret, explorer keys are optional

npm install
npm run start:dev
```

No docker - point `DB_HOST`/`DB_PORT` in `.env` at your own Postgres 15 instead.

Swagger UI: `http://localhost:3000/docs`.

Explorer keys are optional, without them `/wallets/:id/sync` just returns 0 for every chain.
zkSync and Starknet have no tx sync, add activity for them with `POST /activity`.

## Endpoints

```
POST   /auth/register
POST   /auth/login
GET    /auth/nonce
POST   /auth/siwe

GET    /users/me

POST   /wallets
GET    /wallets
DELETE /wallets/:id
GET    /wallets/:id/verify-message
POST   /wallets/:id/verify
GET    /wallets/:id/activity
POST   /wallets/:id/sync
POST   /activity

GET    /wallets/:id/balances
GET    /wallets/:id/stats
GET    /wallets/:id/score

GET    /scoring/rules
GET    /leaderboard
```

## Example

```
curl http://localhost:3000/wallets/1/stats -H "Authorization: Bearer <token>"
```

```json
{
  "total": {
    "txCount": 3,
    "failedCount": 0,
    "uniqueContracts": 3,
    "volumeEth": "0.06",
    "gasEth": "0.0",
    "activeDays": 3,
    "activeMonths": 1,
    "firstTx": "2023-07-01T12:00:00.000Z",
    "lastTx": "2023-07-10T09:15:00.000Z",
    "protocols": { "Uniswap V3": 1, "Stargate": 1, "SyncSwap": 1 },
    "bridges": 1
  }
}
```

`chains` in the real response has the same breakdown split per network, cut here to keep it short.
