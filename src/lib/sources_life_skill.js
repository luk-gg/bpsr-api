import text_en from "$client/Lang/english.json";
import LifeCollectListTable from "$client/Tables/LifeCollectListTable.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";
import LifeFormulaTable from "$client/Tables/LifeFormulaTable.json";
import AwardTable from "$client/Tables/AwardTable.json";
import ItemTable from "$client/Tables/ItemTable.json";
import awardsMap from "./awards";
import awardPackagesMap from "./award_packages";
import convolve from "convolution";

function getYields(recipe) {
    // recipe.Award is either an array (LifeProduction) or integer (LifeCollect)
    const recipeAwards = Array.isArray(recipe.Award) ? recipe.Award : [recipe.Award, recipe.FreeAward]

    return recipeAwards.map((awardId) => {

        const awardItems = awardsMap[awardId] ?? awardPackagesMap[awardId]

        const baseYield = {
            condition: null,
            awards: awardItems
        }

        const bonusYields = recipe.SpecialAward.map(([packId, conditionId]) => {
            const conditionData = LifeFormulaTable[conditionId]
            const awardPackageItems = awardPackagesMap[packId]

            // Convolve rates for every unique item
            const uniqItemIds = new Set(baseYield.awards.map(({ itemId }) => itemId));

            const awards = [...uniqItemIds].flatMap(itemId => {
                const baseRates = baseYield.awards
                    .filter(item => item.itemId === itemId)
                    .map(({ rate }) => rate)

                const talentAwards = awardPackageItems
                    .filter(talentAward => talentAward.itemId === itemId)

                let convolvedRates = baseRates;

                let result;

                // Convolve multiple times if necesary, i.e. if Lv. 4 gives a +1 AND +2 rate
                // Assumes rates are independent and NOT in a sequence such as: +2 fails -> attempt +1 
                // In other words, its possible to get both +1 and +2
                talentAwards.forEach((talent) => {
                    convolvedRates = convolve(convolvedRates, [1 - talent.rate, talent.rate])

                    // Create an array replacing base yields with convolved rates
                    result = baseYield.awards
                        .map((obj, index) => ({ ...obj, rate: convolvedRates[index] }))

                    // Extend array to convolvedRates.length, increasing amounts by how many the talent gives
                    for (let i = result.length; i < convolvedRates.length; i++) {
                        const prev = result[i - 1];
                        const minAmount = prev.minAmount + talent.minAmount;
                        const maxAmount = prev.maxAmount + talent.maxAmount;

                        result.push({
                            ...prev,
                            rate: convolvedRates[i],
                            minAmount,
                            maxAmount,
                            avgAmount: (minAmount + maxAmount) / 2
                        })
                    }
                })

                return result
            })

            return {
                condition: {
                    Name: text_en[conditionData.Name],
                    Des: text_en[conditionData.Des],
                    Icon: conditionData.Icon
                },
                awards
            }
        })

        return [baseYield, ...bonusYields]
    })
}

export default [
    ...Object.values(LifeProductionListTable),
    ...Object.values(LifeCollectListTable)
]
    .reduce((acc, recipe) => {
        let itemId = recipe.RelatedItemId
        // LifeCollectListTable does not have RelatedItemId
        itemId ??= AwardTable[recipe.Award]?.GroupContent[0][0]
        // Some don't even have an Award id...
        itemId ??= Object.values(ItemTable).find(item => item.Icon === recipe.Icon)?.Id
        // Grey-top flax just has the wrong name and icon. Should be Flax
        if (recipe.Id === 20000007) itemId = 1092059
        if (!itemId) console.log(recipe.Id)
    
        if (!acc[itemId]) acc[itemId] = []

        const yieldsByTalentLevel = getYields(recipe)

        acc[itemId].push({
            // ...recipe,
            Name: text_en[recipe.Name],
            Des: text_en[recipe.Des],
            yieldsByTalentLevel,
        })
        return acc
    }, {})