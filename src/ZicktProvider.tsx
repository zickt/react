import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ZicktContext } from './context';
import { callZickt, loadZicktScript } from './script-loader';
import type {
  ZicktConfig,
  ZicktContextValue,
  ZicktIdentifyPayload,
  ZicktProviderProps,
} from './types';

export function ZicktProvider({
  channelKey,
  user,
  company,
  appearance,
  customLauncherSelector,
  hideDefaultLauncher,
  onReady,
  onShow,
  onHide,
  onUnreadCountChanged,
  onUserEmailSupplied,
  children,
}: ZicktProviderProps): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const bootedRef = useRef(false);
  const callbacksRef = useRef({
    onReady,
    onShow,
    onHide,
    onUnreadCountChanged,
    onUserEmailSupplied,
  });

  callbacksRef.current = { onReady, onShow, onHide, onUnreadCountChanged, onUserEmailSupplied };

  useEffect(() => {
    let cancelled = false;

    loadZicktScript()
      .then(() => {
        if (cancelled || bootedRef.current) {
          return;
        }

        bootedRef.current = true;

        callZickt('boot', {
          channel_key: channelKey,
          user,
          company,
          appearance,
          customLauncherSelector,
          hideDefaultLauncher,
          onReady: () => {
            if (!cancelled) {
              setIsReady(true);
              callbacksRef.current.onReady?.();
            }
          },
          onShow: () => callbacksRef.current.onShow?.(),
          onHide: () => callbacksRef.current.onHide?.(),
          onUnreadCountChanged: (count: number) =>
            callbacksRef.current.onUnreadCountChanged?.(count),
          onUserEmailSupplied: () => callbacksRef.current.onUserEmailSupplied?.(),
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error(error);
        }
      });

    return () => {
      cancelled = true;
      if (bootedRef.current) {
        callZickt('shutdown');
        bootedRef.current = false;
        setIsReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once per channelKey
  }, [channelKey]);

  useEffect(() => {
    if (isReady) {
      callZickt('update', {
        user,
        company,
        appearance,
        customLauncherSelector,
        hideDefaultLauncher,
      });
    }
  }, [isReady, user, company, appearance, customLauncherSelector, hideDefaultLauncher]);

  const show = useCallback(() => callZickt('show'), []);
  const hide = useCallback(() => callZickt('hide'), []);
  const showNewMessage = useCallback(
    (message?: string) => callZickt('showNewMessage', message),
    [],
  );
  const identify = useCallback(
    (payload: ZicktIdentifyPayload) => callZickt('identify', payload),
    [],
  );
  const logout = useCallback(() => callZickt('logout'), []);
  const shutdown = useCallback(() => callZickt('shutdown'), []);
  const getVisitorId = useCallback(() => callZickt('getVisitorId') as string | undefined, []);

  const update = useCallback(
    (config: Partial<ZicktConfig>) =>
      callZickt('update', {
        ...(config.user !== undefined && { user: config.user }),
        ...(config.company !== undefined && { company: config.company }),
        ...(config.appearance !== undefined && { appearance: config.appearance }),
        ...(config.customLauncherSelector !== undefined && {
          customLauncherSelector: config.customLauncherSelector,
        }),
        ...(config.hideDefaultLauncher !== undefined && {
          hideDefaultLauncher: config.hideDefaultLauncher,
        }),
      }),
    [],
  );

  const value: ZicktContextValue = useMemo(
    () => ({
      isReady,
      show,
      hide,
      showNewMessage,
      update,
      identify,
      logout,
      getVisitorId,
      shutdown,
    }),
    [isReady, show, hide, showNewMessage, update, identify, logout, getVisitorId, shutdown],
  );

  return <ZicktContext.Provider value={value}>{children}</ZicktContext.Provider>;
}
