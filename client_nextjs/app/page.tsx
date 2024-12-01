import { useUserStore } from '../src/store/userStore';

export default function HomePage() {
  const { auth } = useUserStore();
  // In real app, render Home vs HomeLoggedIn based on auth
  return <div>Home page (auth: {auth ? 'yes' : 'no'})</div>;
}
