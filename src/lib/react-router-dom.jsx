"use client";

import React, { createContext, useContext, useEffect, useMemo, useCallback } from "react";
import NextLink from "next/link";
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation";

// --- Link Component ---
export const Link = React.forwardRef(function Link(
  { to, href, replace, scroll, prefetch, children, ...props },
  ref
) {
  const destination = href || to || "#";
  return (
    <NextLink
      ref={ref}
      href={destination}
      replace={replace}
      scroll={scroll}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </NextLink>
  );
});

// --- useNavigate Hook ---
export function useNavigate() {
  const router = useNextRouter();

  return useCallback(
    (to, options = {}) => {
      if (typeof to === "number") {
        if (to === -1) router.back();
        else if (to === 1) router.forward();
        return;
      }

      if (options?.replace) {
        router.replace(to, { scroll: options.scroll });
      } else {
        router.push(to, { scroll: options.scroll });
      }
    },
    [router]
  );
}

// --- useLocation Hook ---
export function useLocation() {
  const pathname = useNextPathname() || "/";
  const [search, setSearch] = React.useState("");
  const [hash, setHash] = React.useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearch(window.location.search || "");
      setHash(window.location.hash || "");
      const onHashChange = () => setHash(window.location.hash || "");
      window.addEventListener("hashchange", onHashChange);
      return () => window.removeEventListener("hashchange", onHashChange);
    }
  }, [pathname]);

  return useMemo(
    () => ({
      pathname,
      search,
      hash,
      state: null,
      key: "default",
    }),
    [pathname, search, hash]
  );
}

// --- useParams Hook ---
export function useParams() {
  const params = useNextParams();
  return params || {};
}

// --- useSearchParams Hook ---
export function useSearchParams() {
  const nextSearchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = useNextPathname();

  const searchParams = useMemo(() => {
    return new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : "");
  }, [nextSearchParams]);

  const setSearchParams = useCallback(
    (newParams, navigateOpts = {}) => {
      let queryStr = "";
      if (typeof newParams === "function") {
        const updated = newParams(searchParams);
        queryStr = updated instanceof URLSearchParams ? updated.toString() : new URLSearchParams(updated).toString();
      } else if (newParams instanceof URLSearchParams) {
        queryStr = newParams.toString();
      } else if (typeof newParams === "object" && newParams !== null) {
        queryStr = new URLSearchParams(newParams).toString();
      } else if (typeof newParams === "string") {
        queryStr = newParams;
      }

      const target = queryStr ? `${pathname}?${queryStr}` : pathname;
      if (navigateOpts?.replace ?? true) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [router, pathname, searchParams]
  );

  return [searchParams, setSearchParams];
}

// --- Navigate Component ---
export function Navigate({ to, replace = true }) {
  const router = useNextRouter();

  useEffect(() => {
    if (to) {
      if (replace) router.replace(to);
      else router.push(to);
    }
  }, [router, to, replace]);

  return null;
}

// --- Compatibility Passthroughs ---
export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route({ element }) {
  return <>{element}</>;
}

export function Outlet() {
  return null;
}

export default {
  Link,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  BrowserRouter,
  Routes,
  Route,
  Outlet,
};
