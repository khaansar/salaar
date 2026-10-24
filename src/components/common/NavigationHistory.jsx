'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const NavigationHistoryContext = createContext({ previousRoute: null });

function getPreviousRoute(history) {
  return history.index > 0 ? history.routes[history.index - 1] : null;
}

export function NavigationHistoryProvider({ children }) {
  const historyRef = useRef({ routes: [], index: -1 });
  const [previousRoute, setPreviousRoute] = useState(null);

  const recordRoute = useCallback((route, isPopState) => {
    if (!route?.startsWith('/') || route.startsWith('//')) return;

    const history = historyRef.current;

    // The initial route is deliberately not treated as a previous route. This
    // prevents a Back button on a directly opened URL from leaving the app.
    if (history.index === -1) {
      history.routes = [route];
      history.index = 0;
      setPreviousRoute(null);
      return;
    }

    if (history.routes[history.index] === route) return;

    if (isPopState) {
      if (history.routes[history.index - 1] === route) {
        history.index -= 1;
      } else if (history.routes[history.index + 1] === route) {
        history.index += 1;
      } else {
        const matchingIndex = history.routes.lastIndexOf(route);
        if (matchingIndex !== -1) {
          history.index = matchingIndex;
        } else {
          history.routes = [route];
          history.index = 0;
        }
      }
    } else {
      history.routes = history.routes.slice(0, history.index + 1);
      history.routes.push(route);
      history.index += 1;
    }

    setPreviousRoute(getPreviousRoute(history));
  }, []);

  return (
    <NavigationHistoryContext.Provider value={{ previousRoute, recordRoute }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function NavigationHistoryTracker() {
  const pathname = usePathname();
  const { recordRoute } = useContext(NavigationHistoryContext);
  const didPopStateRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      didPopStateRef.current = true;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    recordRoute(pathname, didPopStateRef.current);
    didPopStateRef.current = false;
  }, [pathname, recordRoute]);

  return null;
}

export function useNavigationHistory() {
  return useContext(NavigationHistoryContext);
}
