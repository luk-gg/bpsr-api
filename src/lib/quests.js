import QuestTable from "$client/Tables/QuestTable.json";
import QuestStepTable from "$client/Tables/QuestStepTable.json";
import QuestTypeTable from "$client/Tables/QuestTypeTable.json";
import QuestTypeGroupTable from "$client/Tables/QuestTypeGroupTable.json";
import QuestInfoTable from "$client/Tables/QuestInfoTable.json"; // episodes inside chapters
import QuestInfoTitleTable from "$client/Tables/QuestInfoTitleTable.json"; // MSQ chapters
import { completeCommonData, getBriefItemWithAmount } from "./utils"
import text_en from "$client/Lang/english.json";
import awardPackages from "./award_packages";

// TODO: needs full implementation for every clear condition
function getStepParam(arr) {
    switch (arr[0]) {
        case 1:
        case 9:
        case 12:
        case 20:
        case 24:
        case 25:
        case 27:
        case 28:
        case 29:
        case 43:
        case 70:
        case 98:
        case 99:
        case 106:
        case 107:
        case 109:
        case 110:
        case 111:
        case 117:
        case 137:
        case 145:
        case 179:
        case 200:
        case 206:
        case 207:
        case 208:
        case 211:
        case 232:
        case 233:
        case 234:
        case 272:
        case 302:
        case 310:
            return {}
        case 330: // turn in item??
            // NpcTable Id
            // PresentationEPFlowTable Id some sort of interaction type (says stuff like 普通对话 - normal conversation)
            const [typeMaybe, idk, idk2, npcId, flowTableId, ...itemsAndQuantities] = arr
            const items = []
            for (let i = 0; i < itemsAndQuantities.length; i += 2) {
                items.push(getBriefItemWithAmount([itemsAndQuantities[i], itemsAndQuantities[i + 1]]))
            }
            return {
                tip: "Submit items",
                items
            }
        case 331:
        case 332:
        case 334:
        case 340:
        case 400:
        case 405:
        case 409:
        default:
            return {}
    }
}

function getRepeatability(ResetType) {
    // could not find a file for ResetType enums
    switch (ResetType) {
        case 901:
            return "Daily"
        case 902:
            return "Weekly"
        case -1: // no idea what this is
        case 0:
        default:
            return false
    }
}

export default Object.values(QuestTable)
    .map((quest) => {
        const QuestStep = QuestStepTable[quest.QuestStep]
        const clearConditions = QuestStep?.StepParam?.map(arr => getStepParam(arr))

        // what is questType.Counts? its empty except for type 83 and 68
        const questType = QuestTypeTable[quest.QuestType]
        const questTypeGroup = QuestTypeGroupTable[questType.QuestTypeGroupID]
        const QuestTypeGroupName = text_en[questTypeGroup.GroupName]
        const repeatable = getRepeatability(questType.ResetType)
        const awards = awardPackages[quest.AwardId]
        if (quest.AwardId && !awards?.length) {
            console.log("Quest", quest.QuestId, "does not have rewards!")
        }

        return {
            ...quest,
            ...completeCommonData(quest),
            QuestStep,
            clearConditions,
            // CN text like "Life & Profession Weekly Tasks - Complete once per week"
            QuestTypeName: questType.QuestTypeName,
            QuestTypeGroupName,
            awards,
            repeatable
        }
    })

// // Log ResetType
// console.log(Object.values(QuestTypeTable).reduce((acc, curr) => {
//     if (!acc[curr.ResetType]) acc[curr.ResetType] = []
//     acc[curr.ResetType].push(curr.QuestTypeName)
//     return acc
// }, {}))

// // Log StepParam
// console.log([...new Set(Object.values(QuestStepTable).flatMap(({ StepParam }) => StepParam.map(arr => arr[0])))].sort((a, b) => a - b))

// // Log all StepParam where index 0 is 330
// console.log(Object.values(QuestStepTable).filter((obj) => obj.StepParam[0] && obj.StepParam[0][0] === 330).map(obj => obj.StepParam))