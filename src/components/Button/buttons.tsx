import React, {FC, ReactNode} from "react"
import {BaseButton, ButtonProps} from "./BaseButton"
import "./Button.css"
import "./ButtonIcon.css"
import classNames from "classnames"

export const Button: FC<ButtonProps> = React.memo(props => (
    <BaseButton baseClass="button" {...props} />
))

export const ButtonIcon: FC<ButtonProps> = React.memo(props => (
    <BaseButton baseClass="buttonicon" {...props} />
))

export const Buttons: FC<{
    withBorder?: boolean
    children: ReactNode
}> = React.memo(({ withBorder = false, children }) => (
    <div className={classNames({
        'button-set': true,
        'with-border': withBorder
    })}>
        {children}
    </div>
))

export const ButtonIcons: FC<{ children: ReactNode }> = React.memo(({ children }) => (
    <div className="buttonicon-set">
        {children}
    </div>
))