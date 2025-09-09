import text_en from "$client/Lang/english.json";
import LifeProfessionTable from "$client/Tables/LifeProfessionTable.json";
import expByProfession from "./life_skills_exp"
import gatherableItems from "./life_skills_gatherable_items";
import craftableItems from "./life_skills_craftable_items";
import { sortAlphabeticallyOnce } from "../../util-functions/sortAlphabetically";
import { getBriefArr } from "./utils";

export default
    Object.values(LifeProfessionTable)
        .map((profession) => {
            const recipes = getBriefArr([...gatherableItems, ...craftableItems]
                .filter(recipe => recipe.LifeProId === profession.ProId))

            return {
                ...profession,
                Name: text_en[profession.Name],
                Des: text_en[profession.Des],
                recipes,
                exp: expByProfession[profession.ProId]
            }
        })
        .sort((a, b) =>
            Math.floor(a.ProId / 100) - Math.floor(b.ProId / 100)
            || sortAlphabeticallyOnce(a, b, "Name")
        )