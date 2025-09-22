import ObtainWayTable from "$client/Tables/ObtainWayTable.json"
import FunctionTable from "$client/Tables/FunctionTable.json"
import text_en from "$client/Lang/english.json";
import lifeSkillSources from "./sources_life_skill";
import { getAllText } from "./utils";

// Check for any GetWays ids that don't exist in Function Table
// const uniqWays = new Set(Object.values(ObtainWayTable).flatMap(item => {
//     return item.GetWays.map(way => way[0])
// }))
// console.log([...uniqWays])
// for (const id of [...uniqWays]) {
//     if (!FunctionTable[id]) console.log(id)
// }

const functionsWithParams = []

export default Object.values(ObtainWayTable)
    .reduce((acc, item) => {
        acc[item.Id] = item.GetWays.map(([functionId, functionParam, ...rest]) => {
            if (rest.length > 0) console.log([functionId, functionParam, ...rest])

            const source = FunctionTable[functionId]
            const Name = text_en[source.Name]
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
                    details.recipe = lifeSkillSources[functionParam];
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
            }
            // if (functionId === 501004 && functionParam === 2010060) console.log(details)
            return { ...source, ...getAllText(source), ...details }
        })
        return acc
    }, {})

// console.log([...new Set(functionsWithParams)])