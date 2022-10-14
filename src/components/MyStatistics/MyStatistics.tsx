import React, {useMemo} from "react"
import {useSeedStore} from "../SeedDb/useSeedStore"
import {useGardenPlannerStore} from "../GardenPlannerStore/useGardenPlannerStore"
import {calculateCrossbreedPrediction} from "./calculateStatistics"
import {Bar, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import { BarChart } from "recharts"

export const MyStatistics = React.memo(() => {
    const seedStore = useSeedStore();
    const gardenStore = useGardenPlannerStore();

    const predictionResult = useMemo(() => {
        if (seedStore.isReady) {
            return calculateCrossbreedPrediction(seedStore, gardenStore)
        } else {
            return null;
        }
    }, [
        gardenStore, seedStore
    ])

    if (!seedStore.isReady) return null

    console.log({
        cb: predictionResult?.crossbred,
        bb: predictionResult?.balance
    })
    //throw new Error('ja');
    return (
        <div>
            <style>
                .recharts-surface {'{'}
                    overflow: visible;
                {'}'}
            </style>
            <div className="content">
                <h2>Crop yield</h2>
                <BarChart
                    width={800}
                    height={400}
                    data={predictionResult?.cropYield}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vDay" fill="#8884d8" />
                </BarChart>

                <h2>Consumed seeds</h2>
                <BarChart
                    width={800}
                    height={400}
                    data={predictionResult?.used}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vDay" fill="#8884d8" />
                </BarChart>

                <h2>Crossbred seeds</h2>
                <BarChart
                    width={800}
                    height={400}
                    data={predictionResult?.crossbred}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vDay" fill="#8884d8" />
                </BarChart>

                <h2>Surplus/Surfeit</h2>
                <BarChart
                    width={800}
                    height={400}
                    data={predictionResult?.balance}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vDay" fill="#8884d8" />
                </BarChart>
            </div>
        </div>
    )
})
