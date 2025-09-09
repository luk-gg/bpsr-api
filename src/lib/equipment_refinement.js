import EquipRefineTable from '$client/Tables/EquipRefineTable.json';
import ItemTable from '$client/Tables/ItemTable.json';
import ConditionTable from '$client/Tables/ConditionTable.json';
import EquipPartTable from '$client/Tables/EquipPartTable.json';
import FightAttrTable from '$client/Tables/FightAttrTable.json';
import text_en from "$client/Lang/english.json";
import { getBriefData } from './utils';
import { averageAttempts } from "../../util-functions/avgAttempts"

// AttrAdd: attrNameStr
const attrNameMap = Object.values(FightAttrTable)
    .reduce((acc, curr) => {
        if (!acc[curr.AttrAdd]) acc[curr.AttrAdd] = []
        acc[curr.AttrAdd] = text_en[curr.OfficialName]
        return acc
    }, {})

// RefineId: [refineTableObj]
const refinesMap = Object.values(EquipRefineTable)
    .reduce((acc, curr) => {
        if (!acc[curr.RefineId]) acc[curr.RefineId] = []
        const RefineEffect = curr.RefineEffect.map(([_, attrId, amount]) => `${attrNameMap[attrId]} +${amount}`)
        const RefineConsume = curr.RefineConsume.map(([itemId, amount]) => ({ ...getBriefData(ItemTable[itemId]), amount }))
        const ShowCondition = curr.ShowCondition.map(([conditionId, val1]) => text_en[ConditionTable[conditionId].ShowPurview].replace("{*val*}", val1))
        const Condition = curr.Condition.map(([conditionId, val1]) => text_en[ConditionTable[conditionId].ShowPurview].replace("{*val*}", val1))
        const avgAttempts = averageAttempts(curr.SuccessRate / 10000, curr.FailCompensateRate / 10000)
        acc[curr.RefineId].push({
            ...curr,
            RefineEffect,
            RefineConsume,
            ShowCondition,
            Condition,
            avgAttempts
        })
        return acc
    }, {})

export default Object.values(EquipPartTable)
    .reduce((acc, equipPart) => {
        const PartName = text_en[equipPart.PartName]
        const uniqueRefineIds = new Set(equipPart.RefineId.map(([_, id]) => id)) // 1001, 1002, 2001, 2002 ...
        acc[PartName] = {}
        for (const refineId of uniqueRefineIds) {
            const variant = refineId.toString()[0] // 1: atk, 2: m.atk
            acc[PartName][variant] = refinesMap[refineId]
        }
        return acc
    }, {})