import ObtainWayTable from "$client/Tables/ObtainWayTable.json"
import FunctionTable from "$client/Tables/FunctionTable.json"
import StallDetailTable from "$client/Tables/StallDetailTable.json"
import lifeSkillSources from "./life_skill_recipes";
import { getAllText } from "./utils";
import uniqBy from "lodash/uniqBy";

// Currently uses the in-game list of ways to obtain items. May benefit from doing a manual pass through all possible ways to obtain items to catch any missing sources.

// Check for any GetWays ids that don't exist in Function Table
const uniqWays = new Set(Object.values(ObtainWayTable).flatMap(item => {
    return item.GetWays.map(way => way[0])
}))
// console.log([...uniqWays])
for (const id of [...uniqWays]) {
    if (!FunctionTable[id]) console.log(id)
}

const functionsWithParams = []

export default Object.values(ObtainWayTable)
    .reduce((acc, item) => {
        acc[item.Id] = item.GetWays
            // Filter out redundant blank occurrences of life skill functions
            .filter(([functionId]) => !functionId.toString().startsWith("600"))
            .map(([functionId, functionParam, ...rest]) => {
                // Can increment this if extra param is accounted for in all cases
                if (rest.length > 0) console.log("ObtainWayTable has an extra param", [functionId, functionParam, ...rest])

                const source = FunctionTable[functionId]
                const { Name } = getAllText(source)
                const { Icon, Level, RoleLevel } = source
                let details = {};

                if (functionParam) functionsWithParams.push(Name + " " + functionId)
                switch (functionId) {
                    case 600301: // Gathering
                    case 501001: // Botany
                    case 501002: // Mineralogy
                    case 501003: // Gemology
                    case 501004: // Culinary​
                    case 501005: // Alchemy
                    case 501006: // Smelting
                    case 501007: // Gemcrafting
                    case 501008: // Artisanry​
                    case 501009: // Weaving
                        details.lifeSkillSource = lifeSkillSources[functionParam];
                        break;
                    // case 100103: // Items
                    // case 800811: // Orb Store
                    // case 800817: // Friendship
                    // case 800818: // Honor Coin
                    // case 100804: // Monster Hunt
                    // case 100805: // Monster Hunt - Elite
                    // case 100806: // Monster Hunt - Boss
                    // case 800851: // Box
                    // case 800866: // Other
                    // case 800856: // Other
                    // case 800855: // Mount
                    // case 800854: // Weapon
                    // case 800831: // Box
                    // case 800841: // Box
                    case 800400: // Trading Center
                        details.tradingInfo = StallDetailTable[item.Id]
                        break;
                    case 102503: // Furniture Crafting
                        // Some furniture have multiple recipes but they require the same materials
                        const allRecipes = Object.values(lifeSkillSources).filter(rec => rec.FurnitureId === item.Id);
                        const uniqRecipes = uniqBy(allRecipes, (recipe) => recipe.materials.map(mat => mat.Name + mat.amount).join(""))

                        if (uniqRecipes.length > 1) {
                            console.log("WARNING: Furniture item", item.Id, "has multiple recipes for the same source!")
                            details.lifeSkillSources = uniqRecipes
                        }
                        else {
                            details.lifeSkillSource = uniqRecipes[0]
                        }

                        break;
                }
                // if (functionId === 501004 && functionParam === 2010060) console.log(details)
                return {
                    // ...source,
                    Name,
                    Icon,
                    Level,
                    RoleLevel,
                    ...details
                }
            })
        return acc
    }, {})

// console.log([...new Set(functionsWithParams)])