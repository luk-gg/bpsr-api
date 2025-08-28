import { getBriefArr } from "./utils"
import itemRecipes from "./item_recipes"
import text_en from "$client/Lang/english.json";
import ItemTable from "$client/Tables/ItemTable.json";

// Adds recipes at a depth of 1
const itemsBase = Object.values(ItemTable).map(item => {
    const recipes = itemRecipes[item.Id] ?? []
    const usedIn = []

    return {
        ...item,
        Name: text_en[item.Name],
        Description: text_en[item.Description],
        recipes,
        usedIn
    }
})

// Turn array of items into an object for easy lookup
const itemsBaseMap = itemsBase.reduce((acc, curr) => {
    acc[curr.Id] = curr
    return acc
}, {})

// Recursively iterates recipes to replace material IDs with item objects
const entries = itemsBase.map((item) => {
    const recipes = item.recipes.map(recipe => walkRecipeTree(recipe))
    return {
        ...item,
        recipes
    }
})

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

export const entries_brief = getBriefArr(entries)

export default entries