import {createContext} from "react"

export interface IFormContext {
    value: Object,
    updateField: (property: string, value: any) => void
}

export const FormContext = createContext<IFormContext | null>(null);
