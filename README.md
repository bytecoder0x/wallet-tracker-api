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
