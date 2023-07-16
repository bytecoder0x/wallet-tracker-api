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
const MAX_PAGES = 10;

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
    const result: ExplorerTx[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const response = await axios.get(chainConfig.explorerApi, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page,
          offset: PAGE_SIZE,
          sort: 'asc',
          apikey: apiKey,
        },
      });

      const data = response.data;
      // console.log(data.result?.length);

      // etherscan-like apis answer with status '0' for an empty wallet, not an error
      if (data.status === '0') {
        break;
      }

      const txs: ExplorerTx[] = data.result ?? [];
      result.push(...txs);

      if (txs.length < PAGE_SIZE) {
        break;
      }
    }

    return result;
  }
}
