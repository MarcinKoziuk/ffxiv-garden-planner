import React, {AnchorHTMLAttributes, DetailedHTMLFactory, FC, MouseEventHandler, ReactElement} from "react"
import {Link, LinkProps, useNavigate} from "react-router-dom"
import classNames from "classnames"

type ButtonOrAnchorProps
    = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
    & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

export interface ButtonProps extends ButtonOrAnchorProps {
    className?: string,
    to?: string,
    icon?: ReactElement
}

export interface BaseButtonProps extends ButtonProps {
    baseClass: string
}

export const BaseButton: FC<BaseButtonProps> = React.memo(({
                                                               baseClass,
                                                               to,
                                                               icon,
                                                               children,
                                                               className,
                                                               ...otherProps }) => {
    const theClassName = classNames(baseClass, className, {
        'with-content': !!children
    })

    const inside = (
        <>
            {icon ?? null}
            {icon && ' '}
            {children}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={theClassName} {...otherProps as any}>
                {inside}
            </Link>
        )
    } else if (otherProps.href) {
        return (
            <a className={theClassName} {...otherProps}>
                {inside}
            </a>
        )
    } else {
        return (
            <button type={otherProps.type ?? 'button'} className={theClassName} {...otherProps}>
                {inside}
            </button>
        )
    }
})
