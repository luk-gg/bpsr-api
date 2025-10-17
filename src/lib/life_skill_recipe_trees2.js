import life_skill_recipes, { getMaterials } from "./life_skill_recipes";
import { getBriefItem } from "./utils";
import item_sources_life_skills from "./item_sources_life_skills"
import { trimRecipe } from "./utils";
import item_sources from "./item_sources";
import items from "./items"
import uniqBy from "lodash/uniqBy";

// Nautical Anchor Rug has duplicate recipes, should only show 1: http://localhost:5173/life_skill_recipe_trees2?RelatedItemId=11010074
// Mystery Metal has no materials itself but has 3 variants: http://localhost:5173/life_skill_recipe_trees2?Name=Mystery%20Metal
// Astelpot Feast is a recipe with 3 outputs (see awardGroups): http://localhost:5173/life_skill_recipe_trees2?RelatedItemId=1012053
// Fish Meat - Novice has a variable material (Fish Lv. 1): http://localhost:5173/life_skill_recipe_trees2?RelatedItemId=1082111

// In-game these are unique by ITEM ID but the life skill menu shows RECIPE NAME.
// i.e. Culinary Focused has Astelpot Feast, but clicking on the item brings up the tooltip for item Astelpot Feast Lv. 2. Lv 1 and 3 are not listed.
const craftingRecipes = Object.values(life_skill_recipes).filter(recipe => recipe.RelatedItemId)

const uniqItemRecipes = uniqBy(craftingRecipes, (recipe) => recipe.RelatedItemId)

// Refining materials "base" recipe has no materials so we can append variations that yield the same RelatedItemId
const craftingRecipesWithVariants = uniqItemRecipes.map((recipe) => {
    const recipeVariants = craftingRecipes.filter(cr => cr.RelatedItemId === recipe.RelatedItemId && cr.materials.length > 0)

    // Same as item_sources.js, clean out duplicate recipes if they require the exact same mats + amounts
    const uniqRecipeVariants = uniqBy(recipeVariants, (recipeVariant) => recipeVariant.materials.map(mat => mat.Id + mat.amount).join(""))

    const recipeVariantsRecursiveMats = uniqRecipeVariants.map(recipeVariant => {

        const materialsRecursive = recipeVariant.materials.map(mat => crawlMaterial(mat))

        return {
            ...recipeVariant,
            materials: materialsRecursive
        }
    })

    return {
        ...recipe,
        recipeVariants: recipeVariantsRecursiveMats
    }
})

function crawlMaterial(mat) {
    // TODO: Handle Season Pass EXP and Fish Lv. 2 both having item id 302...
    const item = items.find(i => i.Id === mat.Id && i.Type !== 3) ?? mat

    const sources = item.sources?.map(source => {
        const { lifeSkillSource } = source
        if (!lifeSkillSource) return source

        const materials = lifeSkillSource.materials.map(mat => crawlMaterial(mat))

        return {
            ...source,
            lifeSkillSource: {
                ...lifeSkillSource,
                materials
            }
        }
    })

    const options = item.options?.map(option => crawlMaterial(option))

    return {
        ...item,
        sources,
        options,
        usedIn: undefined
    }
}

export const entries_brief = []
export default craftingRecipesWithVariants