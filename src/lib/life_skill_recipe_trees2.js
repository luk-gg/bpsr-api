import life_skill_recipes, { getMaterials } from "./life_skill_recipes";
import { getBriefItem } from "./utils";
import item_sources_life_skills from "./item_sources_life_skills"
import { trimRecipe } from "./utils";
import item_sources from "./item_sources";
import items from "./items"

// TODO: add back certain things like talent yields, required talents to obtain, etc.
// TODO: make variable materials have a list of "options"

const craftingRecipes = Object.values(life_skill_recipes)
    .filter((recipe) => recipe.RelatedItemId)

function crawlItem(item) {
    const sources = item.sources.map(source => {
        const { lifeSkillSource } = source
        if (!lifeSkillSource) return source

        const materials = lifeSkillSource.materials.map(mat => {
            const matDetails = items.find(item => item.Id === mat.Id)
            // TODO: handle fish
            // if (!matDetails) console.log(mat)
            if (matDetails) {
                // delete matDetails.usedIn
                return crawlItem({ ...matDetails, usedIn: undefined })
            }
        })

        return {
            ...source,
            lifeSkillSource: {
                ...lifeSkillSource,
                materials
            }
        }

    })

    return {
        ...item,
        sources
    }
}

// Just for checking all recipes for that item, including duplicate recipes for furniture.
// const itemRecipes = craftingRecipes
//     .reduce((acc, recipe) => {
//         const outputItemId = recipe.RelatedItemId
//         if (!acc[outputItemId]) acc[outputItemId] = []
//         acc[outputItemId].push(recipe)
//         return acc
//     }, {})

const items = craftingRecipes
    .map((recipe) => {
        const outputItemId = recipe.RelatedItemId
        const item = items.find(item => item.Id === outputItemId)
        return item
    })

const res = items.map(item => crawlItem(item))

export const entries_brief = []
export default res