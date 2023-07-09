import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { chains } from '../chains/chains';

export interface ExplorerTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  isError: string;
  functionName: string;
}

const PAGE_SIZE = 1000;

@Injectable()
export class ExplorerService {
  constructor(private readonly config: ConfigService) {}

  async fetchTransactions(
    chain: string,
    address: string,
  ): Promise<ExplorerTx[]> {
    const chainConfig = chains[chain];
    if (!chainConfig?.explorerApi) {
      return [];
    }

    const explorerKeys = this.config.get('explorerKeys') as Record<
      string,
      string
    >;
    const apiKey = explorerKeys?.[chain] ?? '';

    const response = await axios.get(chainConfig.explorerApi, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: PAGE_SIZE,
        sort: 'asc',
        apikey: apiKey,
      },
    });

    const data = response.data;
    if (data.status === '0') {
      throw new Error(data.message || 'explorer request failed');
    }

    return data.result ?? [];
  }
}
