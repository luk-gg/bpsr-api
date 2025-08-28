import text_en from "$client/Lang/english.json";
import LifeProfessionTable from "$client/Tables/LifeProfessionTable.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";
import gatherableItems from "./life_skills_gatherable_items";
import craftableItems from "./life_skills_craftable_items";

import { sortAlphabetically } from "../../utils";
import { getBriefArr } from "./utils";

// Should I add list of craftable items here?

export default sortAlphabetically(
    Object.values(LifeProfessionTable)
        .map((profession) => {
            const recipes = getBriefArr([...gatherableItems, ...craftableItems]
                .filter(recipe => recipe.LifeProId === profession.ProId))

            return {
                ...profession,
                Name: text_en[profession.Name],
                Des: text_en[profession.Des],
                recipes
            }
        })
)