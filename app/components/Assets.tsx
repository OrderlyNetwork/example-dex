import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw
} from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import { Table } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { FunctionComponent, useMemo } from 'react';

import { useIsTestnet } from '~/hooks/useIsTestnet';
import { supportedChains } from '~/utils/network';

export const Assets: FunctionComponent = () => {
  const { account, state } = useAccount();
  const isTestnet = useIsTestnet();
  const collateral = useCollateral();
  const [chains] = useChains(isTestnet ? 'testnet' : 'mainnet', {
    filter: (item: API.Chain) => supportedChains.includes(item.network_infos?.chain_id)
  });

  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const [{ wallet }] = useConnectWallet();
  const [{ connectedChain }] = useSetChain();
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(connectedChain?.id),
    depositorAddress: account?.address
  });
  const { withdraw, unsettledPnL } = useWithdraw();

  // console.log('account?.chainId', account);
  // console.log('connectedChain', connectedChain);
  // console.log('isTestnet', isTestnet);

  return (
    <div>
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Wallet Balance:</Table.RowHeaderCell>
            <Table.Cell>{deposit.balance}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Deposit Balance:</Table.RowHeaderCell>
            <Table.Cell>{collateral.availableBalance}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Unsettled PnL:</Table.RowHeaderCell>
            <Table.Cell>{unsettledPnL}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </div>
  );
};
