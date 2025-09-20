import { getBriefArr } from "./utils"
// import usedInMap from "./item_used_in"
import text_en from "$client/Lang/english.json";
import ItemTable from "$client/Tables/ItemTable.json";
import StallDetailTable from "$client/Tables/StallDetailTable.json";

// Adds recipes at a depth of 1
const itemsBase = Object.values(ItemTable).map(item => {
    const recipes = []
    const usedIn = []
    const sellable = Boolean(StallDetailTable[item.Id])
    const sellData = StallDetailTable[item.Id] || null

    return {
        ...item,
        Name: text_en[item.Name],
        Description: text_en[item.Description],
        recipes,
        usedIn,
        sellable,
        sellData
    }
})

// Turn array of items into an object for easy lookup
const itemsBaseMap = itemsBase.reduce((acc, curr) => {
    acc[curr.Id] = curr
    return acc
}, {})

function walkRecipeTree(recipe) {
    if (recipe.NeedMaterial.length < 1) return recipe

    const newMaterials = recipe.NeedMaterial
        .filter(([itemId]) => itemId !== 0)
        .map(([itemId, amount]) => {
            return [itemsBaseMap[itemId], amount]
        })
        // Item id 303 causes recipe not to be found in ProdTable 2010031 and 2010214 (food items)
        .map(([item, amount]) => {
            // if (!item) console.log(recipe.Id)
            return [{ ...item, recipes: item?.recipes.map(recipe => walkRecipeTree(recipe)) }, amount]
        })

    return {
        ...recipe,
        NeedMaterial: newMaterials
    }
}

// Recursively iterates recipes to replace material IDs with item objects
const entries = itemsBase.map((item) => {
    const recipes = item.recipes.map(recipe => walkRecipeTree(recipe))
    return {
        ...item,
        recipes
    }
})

export const entries_brief = getBriefArr(entries)

export default entries