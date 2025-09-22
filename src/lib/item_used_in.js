import itemRecipes from "./sources_life_skill"
import { getBriefItemWithAmount } from "./utils";

export default Object.values(itemRecipes)
    .reduce((acc, recipe) => {
        const itemId = recipe.RelatedItemId

        if (!itemId && recipe.NeedMaterial?.length > 0) console.log("Recipe has no output item id but has required materials:", recipe.Id)

        if (itemId) {
            for (const { Id: matId, amount } of recipe.NeedMaterial) {
                if (!acc[matId]) acc[matId] = []
                acc[matId].push(getBriefItemWithAmount([itemId, amount]))
            }
        }
        return acc
    }, {})