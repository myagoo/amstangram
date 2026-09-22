import { useCallback, useEffect, useMemo, useState } from "react"

export function useStoredBoolean(key: string): [boolean, () => void] {
  const [value, setValue] = useState(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(key) ?? "true")
      return typeof stored === "boolean" ? stored : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable; the preference still works in memory.
    }
  }, [key, value])

  const toggle = useCallback(() => setValue((value) => !value), [])
  return useMemo(() => [value, toggle], [value, toggle])
}
