import {Identifiable} from "../models/Identifiable"
import produce from "immer"
import {GetState, SetState} from "zustand"

export interface EntityRepository<T extends Identifiable<I>, I extends number | string> {
    readonly ids: I[]
    readonly byId: Record<I, T>

    addOne(entity: T): void
    updateOne(entity: T): void
    updateOne(entityId: I, recipe: ((entity: T) => void)): void
    upsertOne(entity: T): void
    removeOne(id: I): void
}

export function createEntityRepository<T extends Identifiable<I>,
    I extends number | string,
    U extends object,
    S extends keyof U>(
    key: S,
    set: SetState<U>,
    get: GetState<U>,
    extensions?: object
): EntityRepository<T, I> {
    type ER = EntityRepository<T, I>

    function getScoped(): ER {
        // @ts-ignore
        return get()[key];
    }

    function produceScoped(recipe: (draft: ER) => void) {
        // @ts-ignore
        const scopedValue: ER = get()[key];
        // @ts-ignore
        return produce<U>(get(), state => {
            // @ts-ignore
            state[key] = produce<ER>(scopedValue, recipe);
        })
    }

    function addOne(entity: T) {
        set(produceScoped(state => {
            if (entity.id == null) throw new Error('entity to add should have id')

            state.ids.push(entity.id)
            state.byId[entity.id] = entity
        }));
    }

    function updateOne(entityOrId: T | I, recipe?: ((draft: T) => void)) {
        if (recipe) {
            const id = entityOrId as I;
            set(produceScoped(state => {
                const currentEntity = state.byId[id]
                if (currentEntity === undefined)
                    throw new Error(`entity with id ${id} does not exist, cannot update`)

                state.byId[id] = produce(state.byId[id], recipe)
            }))
        } else {
            const entity = entityOrId as T;
            set(produceScoped(state => {
                if (entity.id == null)
                    throw new Error('entity to update should have id')

                const currentEntity = state.byId[entity.id]
                if (currentEntity === undefined)
                    throw new Error(`entity with id ${entity.id} does not exist, cannot update`)

                state.byId[entity.id] = entity
            }))
        }
    }

    function upsertOne(entity: T) {
        const currentEntity = getScoped().byId[entity.id];
        if (currentEntity) {
            updateOne(entity);
        } else {
            addOne(entity);
        }
    }

    function removeOne(id: I) {
        set(produceScoped(state => {
            const currentEntity = state.byId[id]
            if (currentEntity === undefined)
                throw new Error(`entity with id ${id} does not exist, cannot remove it`)

            delete state.byId[id]
            state.ids.splice(state.ids.indexOf(id), 1)
        }))
    }

    const emptyRecord: Record<I, T> = {} as Record<I, T>
    
    return {
        ids: [],
        byId: emptyRecord,

        addOne,
        updateOne,
        upsertOne,
        removeOne,

        ...extensions
    }
}
