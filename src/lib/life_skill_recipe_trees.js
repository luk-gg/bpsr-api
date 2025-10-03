import life_skill_recipes, { getMaterials } from "./life_skill_recipes";
import { getBriefItem } from "./utils";
import item_sources_life_skills from "./item_sources_life_skills"
import { trimRecipe } from "./utils";

// TODO: add back certain things like talent yields, required talents to obtain, etc.
// TODO: make variable materials have a list of "options"

// A recipe only has one RelatedItemId despite Award being an array.
// An item can have multiple recipes (Mystery Metal) however material items that are crafted seemingly only have one recipe.

// Current code does not handle "OR", where a material can have multiple recipes.
// Sources are omitted because it makes the file go from 3 MB to fucking 498 MB.

const recipesArr = Object.values(life_skill_recipes)

function getChildren(prevDepth, depth) {
    const matsWithRecipes = prevDepth
        .flatMap((parentMat) => {
            if (!parentMat.recipe) return []

            const materials = getMaterials(parentMat.recipe).materials

            return materials.map((mat) => {
                const recipe = recipesArr.find(({ RelatedItemId }) => RelatedItemId === mat.Id) ?? null
                return {
                    parent: parentMat.node,
                    ...mat,
                    recipe: trimRecipe(recipe)
                }
            })
        })

    return addNodeData(matsWithRecipes, depth)
}

function addNodeData(materials, depth) {
    return materials.map((mat, index) => {
        let node = `${depth}${String.fromCharCode(97 + index)}`
        let edge = mat.parent ? `${mat.parent}-${node}` : null
        return {
            node,
            edge,
            ...mat,
        }
    })
}

function getCraftingTreeForRecipe(rootRecipe) {
    let depth = 0;

    const result = [
        addNodeData([{ parent: null, ...getBriefItem(rootRecipe.RelatedItemId), recipe: trimRecipe(rootRecipe) }], depth)
    ];

    while (true) {
        const prevDepth = result[depth++]
        const currDepth = getChildren(prevDepth, depth);
        if (currDepth.length < 1) break
        result.push(currDepth)
    }

    return result.flat().map(mat => {
        if (mat.recipe) return mat

        const lifeSkillSources = item_sources_life_skills[mat.Id]?.map(source => {
            // these are bloating files, largest goes from 37kb to 3.12mb
            delete source.talent_lv0_yields
            delete source.talent_lv1_yields
            delete source.talent_lv2_yields
            delete source.talent_lv3_yields
            delete source.Exp
            delete source.SpecialAward
            return source
        })

        return {
            ...mat,
            lifeSkillSources
        }
    })
}

const recipesWithMaterialTrees = Object.values(life_skill_recipes)
    // .filter(recipe => recipe.Id === 2020027)
    .reduce((acc, recipe) => {
        acc[recipe.Id] = getCraftingTreeForRecipe(recipe)
        return acc
    }, {})

export const entries_brief = []

export default recipesWithMaterialTrees