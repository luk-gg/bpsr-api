import text_en from "$client/Lang/english.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";
import LifeFormulaTable from "$client/Tables/LifeFormulaTable.json";
import awardsMap from "./awards";
import awardPackagesMap from "./award_packages";
import convolve from "convolution";

// Combvines Award and SpecialAward
function getYields(recipe) {
    if (recipe.Award.length < 1) return []

    // LifeProductionListTable Award always seems to be an array with length === 1
    // LifeCollectListTable Award is a integer
    const baseYield = {
        condition: null,
        rates: awardsMap[recipe.Award[0]]
    }

    const bonusYields = recipe.SpecialAward.map(([packId, conditionId]) => {
        const conditionData = LifeFormulaTable[conditionId]

        if (!baseYield.rates) console.log(recipe.Id)
        if (packId === 21100012) console.log(baseYield.rates.map(({rate}) => rate))

        // const baseRates = baseYield.rates.map(({rate}) => rate)
        const bonusRates = awardPackagesMap[packId][0]

        const rates = convolve([0.8, 0.2], [1 - 0.15, 0.15])

        // const rates = awardPackagesMap[packId];

        return {
            condition: {
                Name: text_en[conditionData.Name],
                Des: text_en[conditionData.Des],
                Icon: conditionData.Icon
            },
            rates
        }
    })

    return [baseYield, ...bonusYields]
}
// const yields = [
//     {
//         ...awardRate,
//         condition
//     },
//     {
//         ...awardRate,
//         condition
//     },
//     {
//         ...awardRate,
//         condition
//     },
// ]

export default Object.values(LifeProductionListTable)
    .reduce((acc, recipe) => {
        if (!acc[recipe.RelatedItemId]) acc[recipe.RelatedItemId] = []

        const yields = getYields(recipe)

        acc[recipe.RelatedItemId].push({
            ...recipe,
            yields,
            Name: text_en[recipe.Name],
            Des: text_en[recipe.Des]
        })
        return acc
    }, {})