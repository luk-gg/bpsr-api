import life_skill_recipes from "./life_skill_recipes";
import item_sources from "./item_sources";
import { getBriefItem } from "./utils";

// TODO: add back certain things like talent yields, required talents to obtain, etc.
// TODO: make variable materials have a list of "options"

// A recipe only has one RelatedItemId despite Award being an array.
// An item can have multiple recipes (Mystery Metal) however material items that are crafted seemingly only have one recipe.

// Current code does not handle "OR", where a material can have multiple recipes.
// Sources are omitted because it makes the file go from 3 MB to fucking 498 MB.

function appendLayer(mats, depth) {
    return mats.map((mat, index) => {
        const recipes = (item_sources[mat.Id] ?? []).map(source => source.lifeSkillSource?.Id).filter(id => id);

        return {
            node: `${depth}${String.fromCharCode(97 + index)}`,
            ...mat,
            recipes
        }
    })
}

const recipesWithMaterialTrees = Object.values(life_skill_recipes)
    // .filter(recipe => recipe.Id === 2020027)
    .map(recipe => {
        let goNextDepth = true;
        let depth = 1;

        // since there is only one parent, each node will have only one edge
        const materials = [
            [{ node: "0", ...getBriefItem(recipe.RelatedItemId), recipes: [recipe.Id] }],
            appendLayer(recipe.materials, depth).map(material => ({ parent: "0", edge: `0-${material.node}`, ...material })),
        ]

        while (goNextDepth) {
            const prevMats = materials[depth]
            const currentMats = prevMats
                .flatMap(prevMat => {
                    const prevMatSources = item_sources[prevMat.Id] ?? []
                    const recipes = prevMatSources.filter(source => source.lifeSkillSource).map(source => source.lifeSkillSource)
                    const mats = recipes.flatMap(recipe => recipe.materials)
                    return mats.map(mat => ({ parent: prevMat.node, ...mat }))
                })
            materials.push(appendLayer(currentMats, ++depth)
                .map(material => ({ edge: `${material.parent}-${material.node}`, ...material })))
            goNextDepth = currentMats.length > 0
        }

        return {
            ...recipe,
            materials: materials.flat()
        }
    })
    .filter(recipe => recipe.materials.length)
    // .reduce((acc, curr) => {
    //     acc[curr.Id] = curr.materials
    //     return acc
    // }, {})

export const entries_brief = []

export default recipesWithMaterialTrees