import {State, UseStore} from "zustand"

interface Selector<StoreType> {
    use: {
        [key in keyof StoreType]: () => StoreType[key];
    };
}

type NestedSelector<StoreType> = {
    [key in keyof StoreType]: Selector<StoreType[key]>
} & Selector<StoreType>

export function createNestedSelectorFunctions<StoreType extends State>(store: UseStore<StoreType>): UseStore<StoreType> & NestedSelector<StoreType> {
    Object.entries(store.getState()).forEach(([ key, subState ]) => {
        // @ts-ignore
        store[key] = {
            use: {}
        }

        Object.keys(subState).forEach(subKey => {
            // @ts-ignore
            const selector = state => state[key][subKey]
            // @ts-ignore
            store[key].use[subKey] = () => store(selector)
        })
    })

    // @ts-ignore
    store.use = {};
    Object.keys(store.getState()).forEach(key => {
        // @ts-ignore
        const selector = state => state[key]
        // @ts-ignore
        store.use[key] = () => store(selector)
    });

    return store as UseStore<StoreType> & NestedSelector<StoreType>;
}