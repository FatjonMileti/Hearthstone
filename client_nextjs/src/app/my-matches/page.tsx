import AuthGuard from '../../components/AuthGuard'; export default function Page() { return <AuthGuard><main>my-matches page</main></AuthGuard>; }
