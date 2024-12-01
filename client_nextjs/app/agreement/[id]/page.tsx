import { useParams } from 'next/navigation';
export default function AgreementDetailsPage() { const p = useParams(); return <div>Agreement {p.id}</div>; }
