import text_en from "$client/Lang/english.json";
import LifeCollectListTable from "$client/Tables/LifeCollectListTable.json";

export default Object.values(LifeCollectListTable)
    .map(recipe => {
        return {
            ...recipe,
            Name: text_en[recipe.Name],
            Des: text_en[recipe.Des]
        }
    })