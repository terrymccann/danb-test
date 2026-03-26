import { useSyncExternalStore } from "react"

const emptySubscribe = () => () => {}

/**
 * Returns false during SSR and on the first client render,
 * then true after hydration completes.
 * Use this to defer rendering of client-only content that
 * depends on persisted stores (localStorage).
 */
export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}
