import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
} from "react"
import useSound from "use-sound"

import starSound from "../assets/star.wav"
import buttonSound from "../assets/button.wav"
import cardSound from "../assets/card.wav"
import tangramSound from "../assets/pop.wav"
import victorySound from "../assets/victory.wav"

export const SoundContext = createContext([true, () => {}])

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true)

  const [playStar] = useSound(starSound, {
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

  const [playVictory] = useSound(victorySound, {
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
      playStar,
      playTangram,
      playVictory,
    }),
    [
      soundEnabled,
      toggleSound,
      playButton,
      playToggle,
      playCard,
      playStar,
      playTangram,
      playVictory,
    ]
  )

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  )
}
