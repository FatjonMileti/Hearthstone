import { useParams } from 'next/navigation';

export default function MyAccountNestedPage() {
  const params = useParams();
  return <div>MyAccount nested: {JSON.stringify(params)}</div>;
}
