import LifeProfessionTable from "$client/Tables/LifeProfessionTable.json";
import { sortAlphabeticallyOnce } from "../../util-functions/sortAlphabetically";
import { completeCommonData, getBriefData } from "./utils";
import lifeSkillRecipes from "./life_skill_recipes";
import LifeExpTable from "$client/Tables/LifeExpTable.json";
import LifeFormulaTable from "$client/Tables/LifeFormulaTable.json"; // contains talents

const expTypes = {}

const recipesByProfessionId = Object.values(lifeSkillRecipes)
    .reduce((acc, recipe) => {
        if (!acc[recipe.LifeProId]) acc[recipe.LifeProId] = []
        expTypes[recipe.LifeProId] = { ...recipe.Exp, amount: undefined }
        acc[recipe.LifeProId].push(getBriefData(recipe))
        return acc
    }, {})

// Assumes the levels in the table are in order, not [Lv. 2, Lv. 1, Lv 3]
const expByProfessionId = Object.values(LifeExpTable)
    .reduce((acc, curr) => {
        if (!acc[curr.ProId]) acc[curr.ProId] = []
        acc[curr.ProId].push(curr.Exp[1] ?? null)
        return acc
    }, {})

const talentsByProfessionId = Object.values(LifeFormulaTable)
    .reduce((acc, curr) => {
        if (!acc[curr.ProId]) acc[curr.ProId] = []
        acc[curr.ProId].push({ ...curr, ...completeCommonData(curr) })
        return acc
    }, {})

export default
    Object.values(LifeProfessionTable)
        .map((profession) => {
            const recipes = recipesByProfessionId[profession.ProId]
            const exp = expByProfessionId[profession.ProId]
            const expType = expTypes[profession.ProId]
            const talents = talentsByProfessionId[profession.ProId]

            return {
                ...profession,
                ...completeCommonData(profession),
                recipes,
                exp,
                expType,
                talents
            }
        })
        .sort((a, b) =>
            Math.floor(a.ProId / 100) - Math.floor(b.ProId / 100)
            || sortAlphabeticallyOnce(a, b, "Name")
        )