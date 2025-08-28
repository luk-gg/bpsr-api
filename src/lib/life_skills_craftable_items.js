import text_en from "$client/Lang/english.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";

export default Object.values(LifeProductionListTable)
    .map(recipe => {
        return {
            ...recipe,
            Name: text_en[recipe.Name],
            Des: text_en[recipe.Des]
        }
    })