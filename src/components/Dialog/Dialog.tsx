import React, {FC, ReactNode} from "react"
import { Dialog as ReachDialog, DialogProps as ReachDialogProps } from "@reach/dialog"
import "@reach/dialog/styles.css"
import {CloseSmall, Close} from "@icon-park/react"
import classNames from "classnames"
import "./Dialog.css"
import {ButtonIcon } from "../Button/buttons"

export interface DialogProps extends ReachDialogProps {
    title?: string,
    className?: string,
    extraActions?: ReactNode
}

export const Dialog: FC<DialogProps> = ({ children, title, extraActions, ...props }) => (
    <ReachDialog {...props} className={classNames([ 'dialog', 'pane', props.className ])}>
        <div className="pane-header">
            <div className="pane-title">
                {title}
            </div>
            <div className="pane-actions">
                {extraActions}
                <ButtonIcon icon={<Close />}
                            className="default"
                            onClick={props.onDismiss}
                            title="Close" />
            </div>
        </div>

        {children}
    </ReachDialog>
)

export const DialogBody: FC<{ children: ReactNode, className?: string }> = ({ children, className }) => (
    <div className={classNames('dialog-body', className)}>
        {children}
    </div>
)

export const DialogFooter: FC<{ children: ReactNode, className?: string }> = ({ children, className }) => (
    <div className={classNames('dialog-footer', className)}>
        {children}
    </div>
)