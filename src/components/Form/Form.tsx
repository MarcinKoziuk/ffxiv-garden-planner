import React, {FC, ReactNode, useCallback} from "react"
import {FormContext} from "./FormContext"
import produce from "immer"
import "./Form.css"
import {Children} from "../../lib/propTypes"

interface Props<T> extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    value: T,
    setValue: (value: T) => void,
    children: ReactNode
}

export function Form<T extends Object>({ value, setValue, children, ...formProps }: Props<T>) {
    const updateField = useCallback((property: string, fieldValue: T) => {
        setValue(produce(value, (draft: T) => {
            // @ts-ignore
            draft[property] = fieldValue;
        }));
    }, [ value, setValue ]);

    return (
        <FormContext.Provider value={{
            value,
            updateField
        }}>
            <form className={`pane form ${formProps.className ?? ''}`} {...formProps}>
                {children}
            </form>
        </FormContext.Provider>
    )
}

export const FormActions: FC<Children> = ({ children }) => (
    <div className="pane-footer form-actions">
        {children}
    </div>
)
