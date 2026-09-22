import * as system from "css-system"
import type { ComponentPropsWithRef, Context, ElementType, ReactElement, MouseEventHandler } from "react"
import type { AppTheme } from "../contexts/switchTheme"

// css-system supports aliases, theme tokens and nested selectors at runtime.
export interface Style { [property: string]: string | number | undefined | Style }
export interface StyleProps { css?: Style; deps?: unknown[] }
type Props<C extends ElementType> = StyleProps & { as?: C; mute?: boolean } & Omit<ComponentPropsWithRef<C>, keyof StyleProps | "as">
type Primitive<C extends ElementType> = <As extends ElementType = C>(props: Props<As>) => ReactElement | null
type Defaults = StyleProps & { onClick?: MouseEventHandler; mute?: boolean;[prop: string]: unknown }
type Merge = Defaults | ((props: Defaults) => Defaults)

export const createPrimitive = system.createPrimitive as unknown as <C extends ElementType>(component: C, defaults?: Merge) => Primitive<C>
export const extendPrimitive = system.extendPrimitive as unknown as <C extends ElementType>(component: C, defaults?: Merge) => C
export const ThemeContext = system.ThemeContext as unknown as Context<AppTheme>
export const useKeyframes = system.useKeyframes as unknown as (styles: Style) => string
export const useGlobalCss = system.useGlobalCss as unknown as (styles: Style) => void
export const useGap = system.useGap as unknown as (styles: Style) => Style
