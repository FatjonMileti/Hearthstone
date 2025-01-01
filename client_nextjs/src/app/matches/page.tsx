import AuthGuard from '../../components/AuthGuard'; export default function Page() { return <AuthGuard><main>matches page</main></AuthGuard>; }
