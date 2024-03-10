import { CreateOrder } from '~/components';

export default function Index() {
  return (
    <div className="max-w-full w-md">
      <h1 className="mb-8">Orderly DEX</h1>
      <div>
        <CreateOrder />
      </div>
    </div>
  );
}
