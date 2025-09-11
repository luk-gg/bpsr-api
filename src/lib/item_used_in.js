import LifeCollectListTable from "$client/Tables/LifeCollectListTable.json";
import itemRecipes from "./item_recipes"
import ItemTable from "$client/Tables/ItemTable.json";
import { getBriefData } from "./utils";

const allRecipes = Object.values(itemRecipes).flat()

export default Object.values(ItemTable)
    .reduce((acc, item) => {
        const usedIn = allRecipes
            .filter(recipe => recipe.NeedMaterial.some(([id]) => id === item.Id))
            .map(recipe => getBriefData(recipe))
        if (usedIn.length) acc[item.Id] = usedIn
        return acc
    }, {})