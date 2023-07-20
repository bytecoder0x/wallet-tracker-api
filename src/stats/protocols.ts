// addresses lowercase, checked at compare time

export const protocols: {
  name: string;
  type: 'dex' | 'bridge' | 'aggregator';
  addresses: { [chain: string]: string[] };
}[] = [
  {
    name: 'Uniswap V3',
    type: 'dex',
    addresses: {
      ethereum: [
        '0xe592427a0aece92de3edee1f18e0157c05861564',
        '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
      ],
      arbitrum: [
        '0xe592427a0aece92de3edee1f18e0157c05861564',
        '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
      ],
      optimism: [
        '0xe592427a0aece92de3edee1f18e0157c05861564',
        '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
      ],
    },
  },
  {
    name: 'Uniswap V2',
    type: 'dex',
    addresses: {
      ethereum: ['0x7a250d5630b4cf539739df2c5dacb4c659f2488d'],
    },
  },
  {
    name: 'Stargate',
    type: 'bridge',
    addresses: {
      ethereum: [
        '0x8731d54e9d02c286767d56ac03e8037c07e01e98',
        '0x150f94b44927f078737562f0fcf3c95c01cc2376',
      ],
      arbitrum: [
        '0x53bf833a5d6c4dda888f69c22c88c9f356a41614',
        '0xbf22f0f184bccbea268df387a49ff5238dd23e40',
      ],
      optimism: [
        '0xb0d502e938ed5f4df2e681fe6e419ff29631d62b',
        '0xb49c4e680174e331cb0a7ff3ab58afc9738d5f8b',
      ],
    },
  },
  {
    name: '1inch',
    type: 'aggregator',
    addresses: {
      ethereum: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      arbitrum: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      optimism: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
    },
  },
  {
    // official L1 bridges, from the ethereum side
    name: 'Official bridge',
    type: 'bridge',
    addresses: {
      ethereum: [
        '0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f',
        '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1',
        '0x32400084c286cf3e17e7b677ea9583e60a000324',
        '0xae0ee0a63a2ce6baeeffe56e7714fb4efe48d419',
      ],
    },
  },
  {
    name: 'SyncSwap',
    type: 'dex',
    addresses: {
      zksync: ['0x2da10a1e27bf85cedd8ffb1abbe97e53391c0295'],
    },
  },
];

export function protocolOf(
  chain: string,
  to: string | null,
): { name: string; type: string } | null {
  if (!to) return null;
  const address = to.toLowerCase();

  for (const protocol of protocols) {
    const addresses = protocol.addresses[chain];
    if (addresses && addresses.includes(address)) {
      return { name: protocol.name, type: protocol.type };
    }
  }

  return null;
}
