import text_en from "$client/Lang/english.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";
import ItemTable from "$client/Tables/ItemTable.json";

export default Object.values(LifeProductionListTable)
    .map(recipe => {
        const Icon = recipe.Icon || ItemTable[recipe.RelatedItemId].Icon
        return {
            ...recipe,
            Name: text_en[recipe.Name],
            Icon,
            Des: text_en[recipe.Des]
        }
    })