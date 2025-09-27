import text_en from "$client/Lang/english.json";
import ItemTable from "$client/Tables/ItemTable.json";
import SkillTable from "$client/Tables/SkillTable.json";
import { getConditions } from "../conditions";

/** @import { ItemTable, SkillTable } from '../../../game/client/Tables' */

/** @type {Record<string, ItemTable>} */
const items = ItemTable;
/** @type {Record<string, SkillTable>} */
const skills = SkillTable;

export function getBriefArr(arr) {
    return arr.map(data => getBriefData(data))
}

export function getBriefData(fullData) {
    const { Id, Name, Type, Icon, Cost, NeedLevel, Quality, sellable } = fullData || {}
    return { Id, Name: typeof Name === "number" ? text_en[Name] : Name, Type, Icon, Cost, NeedLevel, Quality, sellable }
}

export function getBriefItem(itemId) {
    return getBriefData(ItemTable[itemId])
}

export function getBriefItemWithAmount(arr) {
    if (!arr) return
    const [itemId, amount] = arr
    return { ...getBriefData(ItemTable[itemId]), amount }
}

export function getAllText(entry) {
    return Object.keys(entry)
        // Name, Des, Description, Description2, ShowPurview, QuestName, QuestDetail, TitleName, PhaseName, TaskInfo
        .filter(key => key.endsWith("$english"))
        .reduce((acc, key) => {
            const originalKey = key.slice(0, key.indexOf("$"))
            const textId = entry[originalKey]
            acc[originalKey] = text_en[textId]
            acc[key] = undefined
            return acc
        }, {})
}

export function completeCommonData(entry) {
    return {
        ...getAllText(entry),
        Exp: getBriefItemWithAmount(entry.Exp),
        Cost: getBriefItemWithAmount(entry.Cost),
        UnlockCondition: getConditions(entry.UnlockCondition),
        // ...getQuickJump(entry),
    }
}

/** @param {number[][]} cost */
export function formatItemCost(cost) {
    return cost.map(([itemId, amount]) => {
        const item = items[itemId]
        return {
            item: {
                id: item.Id,
                name: text_en[item.Name],
                desc: text_en[item.Description],
                desc_ext: text_en[item.Description2],
                icon: item.Icon,
                icon2: item.Icon2,
                type: item.Type
            },
            amount
        }
    })
}

/** 
 * Refer to ConditionTable.json
 * @param {number[][]} conditions 
 */
export function formatConditions(conditions) {
    return conditions.map(([predicate, ...params]) => {
        switch (predicate) {
            case 1:
                if (params.length > 1) {
                    return `Level is between ${params[0]} and ${params[1]}`
                }
                return `Level is more than ${params[0]}`
            case 3:
                return `${params[0]} Talent Points spent (Current Weapon)`
            case 9:
                return `Within the duration of timer: ${params[0]}`
            case 17:
                return `${text_en[skills[params[0]].Name]} reaches level ${params[1]}`
            default:
                console.log(`Unknown Condition: ${[predicate, ...params]}`)
                return ''
        }
    })
}