import {Garden, getPatchIndices, HouseSize} from "../../models/Garden"
import React, {FC, useCallback, useEffect, useMemo, useState} from "react"
import {Form, FormActions} from "../Form/Form"
import {FormRow, InputRow, SelectRow} from "../Form/InputRow"
import {Button} from "../Button/buttons"
import shortUUID from "short-uuid"
import {useGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {useNavigate} from "react-router-dom"
import {GardenPatchType} from "../../models/GardenPatchType"
import produce from "immer"
import {hasSeedsPlanted} from "../../models/GardenPatch"
import {TopsoilId, TopsoilType} from "../../models/Topsoil"
import {useSeedStore} from "../SeedDb/useSeedStore"

interface Props {
    garden?: Garden
}

export const GardenEditForm: FC<Props> = ({ garden }) => {
    const seedStore = useSeedStore();
    const grade3Thanalan = useMemo(() => seedStore.getTopsoilByTypeAndGrade(TopsoilType.Thanalan, 3), [ seedStore ]);

    const [ draftGarden, setDraftGarden ] = useState<Garden>(() => garden
        ? garden
        : {
            id: shortUUID.generate(),
            name: '',
            houseSize: HouseSize.Small,
            patches: [
                {
                    type: GardenPatchType.Deluxe,
                    seeds: [],
                    topsoil: []
                }
            ],
            defaultTopsoil: grade3Thanalan.id
        });
    const [ touchedGardenPatchIndexes, setTouchedGardenPatchIndexes ] = useState<number[]>([])
    const [ seedResetWarning, setSeedResetWarning ] = useState<boolean>(false)

    const gardenStore = useGardenPlannerStore.use.gardens();
    const navigate = useNavigate();


    useEffect(() => {
        setDraftGarden(produce(draftGarden => {
            // Pre-fill patches to 'Deluxe' when increasing house size
            for (let i = 0; i < draftGarden.houseSize; i++) {
                if (!draftGarden.patches[i] && !touchedGardenPatchIndexes.includes(i)) {
                    draftGarden.patches[i] = {
                        type: GardenPatchType.Deluxe,
                        seeds: [],
                        topsoil: []
                    }
                }
            }

            // Ensure number of patches <= houseSize, when decreasing house size
            while (draftGarden.patches.length > draftGarden.houseSize) {
                draftGarden.patches.pop()
                setSeedResetWarning(true)
            }
        }))

    }, [ draftGarden.houseSize, touchedGardenPatchIndexes ])

    const handleChangePatchType = useCallback(e => {
        const value = e.currentTarget.value;
        const index = parseInt(e.currentTarget.name, 10);

        const patchType = value ? value as GardenPatchType : null;
        setDraftGarden(produce(draftGarden => {
            const patch = draftGarden.patches[index]
            if (patchType == null) {
                if (patch) {
                    if (hasSeedsPlanted(patch)) {
                        setSeedResetWarning(true)
                    }
                    delete draftGarden.patches[index]
                }
            } else {
                if (!patch || patch.type !== patchType) {
                    if (patch && hasSeedsPlanted(patch)) {
                        setSeedResetWarning(true)
                    }

                    draftGarden.patches[index] = {
                        type: patchType,
                        seeds: [],
                        topsoil: []
                    }
                }
            }
        }))

        setTouchedGardenPatchIndexes(prevTouched => [ ...prevTouched, index ])
    }, []);

    const handleSubmit = useCallback(e => {
        e.preventDefault();


        const newGarden = produce(draftGarden, draftGarden => {
            // Clean up gaps ['Deluxe', null, 'Deluxe'] => ['Deluxe', 'Deluxe']
            draftGarden.patches = draftGarden.patches.filter(p => !!p)
        });

        gardenStore.upsertOne(newGarden);
        navigate("..");
    }, [ navigate, draftGarden, gardenStore ])

    const patchIndices = getPatchIndices(draftGarden)

    return (
        <Form<Garden> value={draftGarden} setValue={setDraftGarden} onSubmit={handleSubmit}>
            <InputRow label="Name"
                      path="name"
                      className="large"
                      placeholder="e.g. Lavender beds private home"
                      required />

            <SelectRow label="House size"
                       path="houseSize"
                       options={<>
                           <option value={HouseSize.Small} >Cottage (small)</option>
                           <option value={HouseSize.Medium}>House (medium)</option>
                           <option value={HouseSize.Large}>Mansion (large)</option>
                       </>}
                       valueToString={v => (v != null ? v.toString() : '')}
                       stringToValue={v => (v === '' ? null : parseInt(v))}
                       required />
            { patchIndices.map(index => (
                <FormRow key={index} label={`Patch ${index + 1}`}>
                    {id => (
                        <select id={id}
                                value={draftGarden.patches[index] ? draftGarden.patches[index].type : ''}
                                onChange={handleChangePatchType}
                                name={index.toString()}
                                className="form-input">
                            <option value="" label="Empty" />
                            <option value={GardenPatchType.Round}>Round (four beds)</option>
                            <option value={GardenPatchType.Oblong}>Oblong (six beds)</option>
                            <option value={GardenPatchType.Deluxe}>Deluxe (eight beds)</option>
                        </select>
                    )}
                </FormRow>
            ))}
            <SelectRow label="Default topsoil"
                       path="defaultTopsoil"
                       options={<>
                           <option value="">None</option>
                           {seedStore.topsoils.ids.map(topsoilId => {
                               const topsoil = seedStore.topsoils.byId[topsoilId];
                               return (
                                   <option key={topsoilId} value={topsoilId}> {topsoil.name}</option>
                               )
                           })}
                       </>}
                       valueToString={v => (v != null ? v.toString() : '')}
                       stringToValue={v => (v === '' ? null : parseInt(v) as TopsoilId)} />

            { seedResetWarning && (
                <div>
                    Warning! Change in configuration of garden patches will cause selected seeds to be reset.
                </div>
            )}

            <FormActions>
                <Button to=".." className="outline-primary">Cancel</Button>
                <Button type="submit" className="primary">Save</Button>
            </FormActions>
        </Form>
    )
}
