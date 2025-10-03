import life_skill_recipes, { getMaterials } from "./life_skill_recipes";
import item_sources from "./item_sources";
import { getBriefItem } from "./utils";

// TODO: add back certain things like talent yields, required talents to obtain, etc.
// TODO: make variable materials have a list of "options"

// A recipe only has one RelatedItemId despite Award being an array.
// An item can have multiple recipes (Mystery Metal) however material items that are crafted seemingly only have one recipe.

// Current code does not handle "OR", where a material can have multiple recipes.
// Sources are omitted because it makes the file go from 3 MB to fucking 498 MB.

const recipesArr = Object.values(life_skill_recipes)

function getNodes(recipe, depth, result, parentIndex = 0) {
    if (!recipe) return []

    const materials = depth > 0 ? getMaterials(recipe).materials : [getBriefItem(recipe.RelatedItemId)]

    console.log(materials.length)

    return materials.map((mat, index) => {
        let node = `${depth}${String.fromCharCode(97 + index + parentIndex)}`
        let parent = null
        let edge = null

        if (depth > 0) {
            parent = result[depth - 1][parentIndex].node
            edge = `${parent}-${node}`
        }

        const newRecipe = recipesArr.find(({ RelatedItemId }) => RelatedItemId === mat.Id) ?? null

        const res = {
            node,
            parent,
            parentIndex,
            // edge,
            ...mat,
        }

        if (newRecipe) res.recipe = newRecipe

        return res
    })
}

function getNodesD(prevDepth, depth) {
    return prevDepth
        .flatMap((parentMat) => {
            if (!parentMat.recipe) return []

            const materials = getMaterials(parentMat.recipe).materials

            return materials.map((mat) => {
                const newRecipe = recipesArr.find(({ RelatedItemId }) => RelatedItemId === mat.Id) ?? null
                return {
                    parent: parentMat.node,
                    ...mat,
                    recipe: newRecipe
                }
            })
        })
        .map((mat, index) => {
            let node = `${depth}${String.fromCharCode(97 + index)}`
            let edge = `${mat.parent}-${node}`

            return {
                node,
                edge,
                ...mat,
            }
        })

}

function getCraftingTreeForRecipe(rootRecipe) {
    let depth = 0;

    const result = [];
    result.push(getNodes(rootRecipe, depth))
    console.log(getNodesD(rootRecipe, depth))

    while (true) {
        const prevDepth = result[depth++]
        // console.log(prevDepth.map(mat => mat.recipe))
        const currDepth = getNodesD(prevDepth, depth);
        // const currDepth = prevDepth.flatMap(({ recipe }, parentIndex) => getNodes(recipe, depth, result, parentIndex))
        if (currDepth.length < 1) break
        // console.log(currDepth.length)
        result.push(currDepth)
    }

    return result.flat()
}

const recipesWithMaterialTrees = Object.values(life_skill_recipes)
    .filter(recipe => recipe.Id === 2020027)
    .map(recipe => getCraftingTreeForRecipe(recipe))
// .filter(mats => mats.length)
// .reduce((acc, curr) => {
//     acc[curr.Id] = curr.materials
//     return acc
// }, {})

export const entries_brief = []

export default recipesWithMaterialTrees