'use client';

import { Home } from '../view-components/Home/Home';
import { HomeLoggedIn } from '../view-components/HomeLoggedIn/HomeLoggedIn/HomeLoggedIn';
import { useUserStore } from '../globalState/user';

export default function Page() {
  const userStore = useUserStore();
  return userStore.auth ? <HomeLoggedIn /> : <Home />;
}
