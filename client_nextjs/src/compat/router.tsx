'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams, useParams as useNextParams } from 'next/navigation';
import NextLink from 'next/link';

export function useNavigate() {
  const router = useRouter();
  return (to: any, options?: any) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (typeof to === 'string') {
      router.push(to);
      return;
    }
    if (to && typeof to === 'object') {
      router.push(`${to.pathname || ''}${to.search || ''}`);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams && searchParams.toString() ? `?${searchParams.toString()}` : '';
  return { pathname, search };
}

export function useParams<T = any>() {
  return useNextParams() as unknown as T;
}

type NavLinkProps = {
  to: string;
  end?: boolean;
  className?: any;
  children?: any;
  [key: string]: any;
};

export function NavLink({ to, end, className, children, ...rest }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname === to || pathname?.startsWith(to + '/');
  const classNameValue =
    typeof className === 'function' ? className({ isActive }) : className;
  return (
    <NextLink href={to} className={classNameValue} {...rest}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </NextLink>
  );
}

export function Link({ to, children, ...rest }: any) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  );
}

export function Route(_props: any) {
  return null;
}

export function Routes({ children }: { children?: any }) {
  const pathname = usePathname() || '';
  const routeElements = (React.Children.toArray(children) as any[]).filter(
    (c: any) => c && c.props && typeof c.props.path === "string"
  );
  const candidates = routeElements
    .filter((c: any) => c.props.path !== '/')
    .filter((c: any) => pathname.endsWith(c.props.path) || pathname.endsWith(`${c.props.path}/`));
  const rootCandidate = routeElements.find((c: any) => c.props.path === '/');
  const match = candidates.sort((a: any, b: any) => b.props.path.length - a.props.path.length)[0] || (candidates.length === 0 ? rootCandidate : undefined);
  return <>{match ? match.props.element : null}</>;
}
