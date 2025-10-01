import life_skill_recipes from "./life_skill_recipes";
import item_sources from "./item_sources";

// TODO: add back certain things like talent yields, required talents to obtain, etc.
// Sources are omitted because it makes the file go from 3 MB to fucking 498 MB.

function appendLayer(mats, depth) {
    return mats.map((mat, index) => {
        const recipes = (item_sources[mat.Id] ?? []).map(source => source.lifeSkillSource?.Id).filter(id => id);

        return {
            node: `d${depth}_${index}`,
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
        const materials = [appendLayer(recipe.materials, depth)]

        while (goNextDepth) {
            const prevMats = materials[depth - 1]
            const currentMats = prevMats
                .flatMap(prevMat => {
                    const prevMatSources = item_sources[prevMat.Id] ?? []
                    const recipes = prevMatSources.filter(source => source.lifeSkillSource).map(source => source.lifeSkillSource)
                    const mats = recipes.flatMap(recipe => recipe.materials)
                    return mats.map(mat => ({ parent: prevMat.node, ...mat }))
                })
            materials.push(appendLayer(currentMats, ++depth))
            goNextDepth = currentMats.length > 0
        }

        return {
            ...recipe,
            materials: materials.flat()
        }
    })

export const entries_brief = []

export default recipesWithMaterialTrees