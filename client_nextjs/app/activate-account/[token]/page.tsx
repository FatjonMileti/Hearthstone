import { useParams } from 'next/navigation';
export default function ActivateAccountPage() { const p = useParams(); return <div>Activate Account: {p.token}</div>; }
