import React, {FC, ReactElement, ReactNode, useRef} from "react"
import {FormContext} from "./FormContext"
import shortUUID from "short-uuid"
import {useRequiredContext} from "../../lib/useRequiredContext"

export const FormRow: FC<{ label: string, children: (id: string) => ReactNode }> = ({ label, children }) => {
    const id = useRef(shortUUID.generate());
    return (
        <div className="pane-section form-row">
            <label htmlFor={id.current} className="form-label">
                {label}
            </label>
            {children(id.current)}
        </div>
    )
}

interface BaseInputProps {
    label: string,
    path: string
}

interface BaseInputRowProps extends BaseInputProps {
    renderInput: (id: string, value: string, onChange: (value: string | null) => void) => ReactNode
}

const BaseInputRow: FC<BaseInputRowProps> = ({path, label, renderInput}) => {
    const formContext = useRequiredContext(FormContext);
    return (
        <FormRow label={label}>
            {id => renderInput(
                id,
                (formContext.value as any)[path] + '',
                value => formContext.updateField(path, value)
            )}
        </FormRow>
    )
}


interface InputProps extends BaseInputProps, React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    type?: string
}

export const InputRow: FC<InputProps> = ({path, label, type = 'text', className, ...inputProps}) => (
    <BaseInputRow label={label} path={path} renderInput={(id, value, onChange) => (
        <input
            type={type}
            value={value}
            onChange={e => {
                onChange(e.currentTarget.value);
            }}
            className={`form-input ${className ?? ''}`}
            {...inputProps}
        />
    )}/>
)

interface SelectInputProps extends BaseInputProps, React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
    options: ReactElement,
    valueToString: (value: any) => string,
    stringToValue: (str: string) => any
}

export const SelectRow: FC<SelectInputProps> = ({
                                                    path,
                                                    label,
                                                    options,
                                                    className,
                                                    valueToString,
                                                    stringToValue,
                                                    ...selectProps
                                                }) => (
    <BaseInputRow label={label} path={path} renderInput={(id, value, onChange) => (
        <select
            value={valueToString(value)}
            onChange={e => onChange(stringToValue(e.currentTarget.value))}
            className={`form-input ${className ?? ''}`}
            {...selectProps}>
            {options}
        </select>
    )}/>
)