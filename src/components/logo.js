import React, { useContext } from "react"
import { ThemeContext } from "../contexts/theme"

export const Logo = props => {
  const theme = useContext(ThemeContext)
  const { st1, st2, mt1, lt1, lt2, sq, rh } = theme.colors
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 368 61"
      {...props}
    >
      <path fill={st1} d="M109.1 11l-5.3 5.3-5.3-5.3 5.3-5.3 5.3 5.3z" />
      <path fill={st2} d="M106.2 35.6L95.6 25v21.2l10.6-10.6z" />
      <path fill={mt1} d="M84 23.6l10.6 10.6V13L84 23.6z" />
      <path fill={lt1} d="M94.6 35.6L84 46.2h10.6V35.6z" />
      <path fill={lt2} d="M78 40.3l5.3 5.3 5.3-5.3H78z" />
      <path fill={sq} d="M94.5 11.5H87V19l7.5-7.5z" />
      <path fill={rh} d="M97.6 10.6H87l5.3-5.3H103l-5.3 5.3z" />
      <path fill={st1} d="M137.5 14.5H130V7h7.5v7.5z" />
      <path fill={st2} d="M122.5 39l-10.6 10.6H133L122.5 39z" />
      <path fill={mt1} d="M129 7h-15l15 15V7z" />
      <path fill={lt1} d="M121 24v15l7.5-7.5L121 24z" />
      <path fill={lt2} d="M128.3 33l-5.3 5.3 5.3 5.3V33z" />
      <path fill={sq} d="M113 7.5V15h7.5L113 7.5z" />
      <path fill={rh} d="M121.2 23l7.5 7.5V23l-7.4-7.6V23z" />
      <path fill={st1} d="M71.5 42H64v-7.5h7.5V42z" />
      <path fill={st2} d="M61 21.6l10.6 10.6V11L61 21.6z" />
      <path fill={mt1} d="M50.2 21.6L39.6 11v21.2l10.6-10.6z" />
      <path fill={lt1} d="M63 18H48l7.5 7.5L63 18z" />
      <path fill={lt2} d="M40 42.5h7.5V35L40 42.5z" />
      <path fill={sq} d="M64.1 26.1v7.5h7.5l-7.5-7.5z" />
      <path fill={rh} d="M47.5 33.5L40 41v-7.5l7.5-7.5v7.5z" />
      <path fill={st1} d="M356.5 41H349v-7.5h7.5V41z" />
      <path fill={st2} d="M346 20.6l10.6 10.6V10L346 20.6z" />
      <path fill={mt1} d="M335.2 20.6L324.6 10v21.2l10.6-10.6z" />
      <path fill={lt1} d="M348 17h-15l7.5 7.5L348 17z" />
      <path fill={lt2} d="M325 41.5h7.5V34l-7.5 7.5z" />
      <path fill={sq} d="M349.1 25.1v7.5h7.5l-7.5-7.5z" />
      <path fill={rh} d="M332.5 32.5L325 40v-7.5l7.5-7.5v7.5z" />
      <path fill={st1} d="M151.5 44H144v-7.5h7.5V44z" />
      <path fill={st2} d="M155.6 7L145 17.6h21.2L155.6 7z" />
      <path fill={mt1} d="M144 19v15l15-15h-15z" />
      <path fill={lt1} d="M168 36V20l-8 8 8 8z" />
      <path fill={lt2} d="M167.5 19H160v7.5l7.5-7.5z" />
      <path fill={sq} d="M162.3 42.6l5.3-5.3-5.3-5.3v10.6z" />
      <path fill={rh} d="M151.5 28l-7.5 7.5h7.5L159 28h-7.5z" />
      <path fill={st1} d="M202.3 21.6l-5.3-5.3 5.3-5.3 5.3 5.3-5.3 5.3z" />
      <path fill={st2} d="M180 24h15L180 9v15z" />
      <path fill={mt1} d="M195.5 25h-15l15 15V25z" />
      <path fill={lt1} d="M185.3 33L174 44.3h11.3V33z" />
      <path fill={lt2} d="M180 36.6l5.3-5.3L180 26v10.6z" />
      <path fill={sq} d="M196.7 28.6l5.3-5.3-5.3-5.3v10.6z" />
      <path fill={rh} d="M202.1 35.6V25l-5.3 5.3v10.6l5.3-5.3z" />
      <path fill={st1} d="M242.5 36.5H235V29h7.5v7.5z" />
      <path fill={st2} d="M214 20.6l10.6 10.6V10L214 20.6z" />
      <path fill={mt1} d="M214 37h15l-15-15v15z" />
      <path fill={lt1} d="M239 38h-16l8 8 8-8z" />
      <path fill={lt2} d="M225.5 10v7.5h7.5l-7.5-7.5z" />
      <path fill={sq} d="M233.5 16.5V9H226l7.5 7.5z" />
      <path fill={rh} d="M221.5 45.5L214 38h7.5l7.5 7.5h-7.5z" />
      <path fill={st1} d="M270.5 34H263v-7.5h7.5V34z" />
      <path fill={st2} d="M251 14v15l15-15h-15z" />
      <path fill={mt1} d="M251 30.6l10.6 10.6V20L251 30.6z" />
      <path fill={lt1} d="M262 43.3L250.7 32v11.3H262z" />
      <path fill={lt2} d="M271.3 29.6l5.3-5.3-5.3-5.3v10.6z" />
      <path fill={sq} d="M275.5 21.5V14H268l7.5 7.5z" />
      <path fill={rh} d="M274.5 42.5L267 35h7.5l7.5 7.5h-7.5z" />
      <path fill={st1} d="M7.5 45H0v-7.5h7.5V45z" />
      <path fill={st2} d="M11.6 8L1 18.6h21.2L11.6 8z" />
      <path fill={mt1} d="M0 20v15l15-15H0z" />
      <path fill={lt1} d="M24 37V21l-8 8 8 8z" />
      <path fill={lt2} d="M23.5 20H16v7.5l7.5-7.5z" />
      <path fill={sq} d="M18.3 43.6l5.3-5.3-5.3-5.3v10.6z" />
      <path fill={rh} d="M7.5 29L0 36.5h7.5L15 29H7.5z" />
      <path fill={st1} d="M295.5 44H288v-7.5h7.5V44z" />
      <path fill={st2} d="M299.6 7L289 17.6h21.2L299.6 7z" />
      <path fill={mt1} d="M288 19v15l15-15h-15z" />
      <path fill={lt1} d="M312 36V20l-8 8 8 8z" />
      <path fill={lt2} d="M311.5 19H304v7.5l7.5-7.5z" />
      <path fill={sq} d="M306.3 42.6l5.3-5.3-5.3-5.3v10.6z" />
      <path fill={rh} d="M295.5 28l-7.5 7.5h7.5L303 28h-7.5z" />
    </svg>
  )
}
