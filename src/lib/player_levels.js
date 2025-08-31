import text_en from "$client/Lang/english.json";
import PlayerLevelTable from "$client/Tables/PlayerLevelTable.json"
import AssessModuleTable from "$client/Tables/AssessModuleTable.json"
import AwardTable from "$client/Tables/AwardTable.json"
import ItemTable from "$client/Tables/ItemTable.json"
import ItemFunctionTable from "$client/Tables/ItemFunctionTable.json"
import { getBriefData } from "./utils";

const statMap = {
    "11012": "str",
    "11022": "int",
    "11032": "agi",
    "11042": "sta",
}

// Replaces GroupContent item IDs with item data
function getAwardItems(awardId) {
    if (!AwardTable[awardId]) return []
    return AwardTable[awardId].GroupContent
        .map(([itemId, minAmount, maxAmount]) => ({ ...getBriefData(ItemTable[itemId]), minAmount, maxAmount }))
}

export default Object.values(PlayerLevelTable)
    .map(level => {
        const LevelUpAttr = level.LevelUpAttr.reduce((acc, [statId, value]) => {
            acc[statMap[statId]] = value
            return acc
        }, {})

        // Send the Title and Text in a separate JSON to avoid redundant data payload?
        const NacsStandard = level.NacsStandard.map(([moduleId, value]) => {
            const Title = text_en[AssessModuleTable[moduleId].Title]
            const TextDes = text_en[AssessModuleTable[moduleId].TextDes]
            return {
                Title,
                TextDes,
                value
            }
        })

        // TODO: Refactor into a sources/awards endpoint
        // Can have multiple Parameters (AwardIDs)
        // Each Award can have multiple Items with different weights

        const awardItems =
            // AwardTable 10001120: { GroupContent 1040099 }
            // ItemTable 1040099: { Name "Lv. 55 Gift Box", Type 104 }
            getAwardItems(level.LevelAwardID)
                // ItemFunctionTable 1040099: { Parameter 10001240 }
                .map((item) => {
                    // Item Type 104 seems to be a box/package
                    if (item.Type === 104) {
                        item.contents = ItemFunctionTable[item.Id].Parameter
                            .flatMap((paramId) => {
                                // Maybe only ItemFunctionTable Type 2 is an Award?
                                // AwardTable 10001240: { GroupContent [10008, 1015001, 1022002] }
                                // ItemTable 10008, 1015001, 1022002
                                return getAwardItems(paramId)
                            })
                    }

                    // add item.weights if needed

                    return item
                })

        return {
            ...level, // Mainly Level, Exp, TalentAward, FightValue
            LevelUpAttr,
            NacsStandard,
            awardItems
        }
    })