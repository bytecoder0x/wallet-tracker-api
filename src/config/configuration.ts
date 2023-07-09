export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: '7d',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'wallet_tracker',
  },
  explorerKeys: {
    ethereum: process.env.ETHERSCAN_API_KEY,
  },
});
