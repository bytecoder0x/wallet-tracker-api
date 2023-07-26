export interface ScoringRule {
  id: string;
  description: string;
  points: number;
  max: number;
}

export const rules: ScoringRule[] = [
  {
    id: 'tx_count',
    description: '1 point per transaction',
    points: 1,
    max: 100,
  },
  {
    id: 'unique_contracts',
    description: '5 points per unique contract interacted with',
    points: 5,
    max: 100,
  },
  {
    id: 'active_months',
    description: '10 points per active month',
    points: 10,
    max: 120,
  },
  {
    id: 'volume',
    description: '2 points per every 0.1 ETH of outgoing volume',
    points: 2,
    max: 100,
  },
  {
    id: 'bridge_tx',
    description: '20 points per bridge transaction',
    points: 20,
    max: 100,
  },
  {
    id: 'known_protocol',
    description: '15 points per transaction to a known protocol',
    points: 15,
    max: 90,
  },
];
