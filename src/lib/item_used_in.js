import itemRecipes from "./sources_life_skill"
import { getBriefItemWithAmount } from "./utils";
import HousingItems from "$client/Tables/HousingItems.json";

const housingRecipesByMatId = Object.values(HousingItems)
    .reduce((acc, furniture) => {
        const mats = [...furniture.Consume, furniture.ConsumeCash]
        if (mats.flat().length > 0) {
            for (const [matId, amount] of [...furniture.Consume, furniture.ConsumeCash]) {
                if (!matId) console.log("Missing material for furniture:", furniture.Id)
                if (!acc[matId]) acc[matId] = []
                acc[matId].push(getBriefItemWithAmount([furniture.Id, amount]))
            }
        }
        return acc
    }, {})

export default Object.values(itemRecipes)
    .reduce((acc, recipe) => {
        const itemId = recipe.RelatedItemId

        if (!itemId && recipe.NeedMaterial?.length > 0) console.log("Recipe has no output item id but has required materials:", recipe.Id)

        if (itemId) {
            for (const { Id: matId, amount } of recipe.NeedMaterial) {
                if (!matId) console.log("Missing material for recipe:", recipe.Id)
                if (!acc[matId]) acc[matId] = housingRecipesByMatId[matId] ?? []
                acc[matId].push(getBriefItemWithAmount([itemId, amount]))
            }
        }
        return acc
    }, {})