import item_sources from "./item_sources"
import { trimRecipe } from "./utils"

export default Object.entries(item_sources)
    .reduce((acc, [itemId, sources]) => {
        const lifeSkillSources = sources.filter(source => source.lifeSkillSource)
        if (lifeSkillSources.length) {
            acc[itemId] = lifeSkillSources.map(source => trimRecipe(source.lifeSkillSource))
        }
        return acc
    }, {})
