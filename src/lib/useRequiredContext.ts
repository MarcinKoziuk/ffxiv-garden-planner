import {Context, useContext} from "react"

export function useRequiredContext<T>(context: Context<T | null>): T {
    const result: T | null = useContext(context);
    if (result === null) {
        throw new Error(`Context ${context} is required.`);
    }
    return result;
}

