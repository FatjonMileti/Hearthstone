import AuthGuard from '../../components/AuthGuard'; export default function Page() { return <AuthGuard><main>messages page</main></AuthGuard>; }
