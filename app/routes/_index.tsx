import { Chart, CreateOrder } from '~/components';

export default function Index() {
  return (
    <div className="max-w-full w-full mt-6 flex flex-col flex-items-center gap-4">
      <Chart symbol="PERP_ETH_USDC" />
      <CreateOrder />
    </div>
  );
}
