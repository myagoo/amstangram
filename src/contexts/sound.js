import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
} from "react"
import useSound from "use-sound"

import clapSound from "../sounds/clap.wav"
import buttonSound from "../sounds/button.wav"
import cardSound from "../sounds/card.wav"
import tangramSound from "../sounds/pop.wav"

export const SoundContext = createContext([true, () => {}])

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true)

  const [playClap] = useSound(clapSound, {
    soundEnabled,
  })
  const [playButton] = useSound(buttonSound, {
    soundEnabled,
  })
  const [playToggle] = useSound(buttonSound, {
    soundEnabled,
  })
  const [playCard] = useSound(cardSound, {
    soundEnabled,
  })

  const [playTangram] = useSound(tangramSound, {
    soundEnabled,
  })

  useEffect(() => {
    setSoundEnabled(
      window.localStorage.getItem("sound") === "off" ? false : true
    )
  }, [])

  const toggleSound = useCallback(() => {
    const newSoundsEnabled = !soundEnabled
    setSoundEnabled(newSoundsEnabled)
    window.localStorage.setItem("sound", newSoundsEnabled ? "on" : "off")
  }, [soundEnabled])

  const contextValue = useMemo(
    () => ({
      soundEnabled,
      toggleSound,
      playButton,
      playToggle,
      playCard,
      playClap,
      playTangram,
    }),
    [
      soundEnabled,
      toggleSound,
      playButton,
      playToggle,
      playCard,
      playClap,
      playTangram,
    ]
  )

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  )
}
