import { useParams } from 'next/navigation';
export default function DashboardMyAccountNested() { const p = useParams(); return <div>Dashboard MyAccount nested: {JSON.stringify(p)}</div>; }
