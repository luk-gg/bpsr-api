import EquipRefineTable from '$client/Tables/EquipRefineTable.json';
import ConditionTable from '$client/Tables/ConditionTable.json';
import EquipPartTable from '$client/Tables/EquipPartTable.json';
import FightAttrTable from '$client/Tables/FightAttrTable.json';
import text_en from "$client/Lang/english.json";
import { getBriefItemWithAmount } from './utils';
import { averageAttempts } from "../../util-functions/avgAttempts"

// AttrAdd: attrNameStr
const attrNameMap = Object.values(FightAttrTable)
    .reduce((acc, curr) => {
        if (!acc[curr.AttrAdd]) acc[curr.AttrAdd] = []
        acc[curr.AttrAdd] = text_en[curr.OfficialName]
        return acc
    }, {})

const equipRefineValues = Object.values(EquipRefineTable)

// RefineId: [refineTableObj]
const refinesMap = equipRefineValues
    .reduce((acc, curr, idx) => {
        if (!acc[curr.RefineId]) acc[curr.RefineId] = []
        const prevLevel = idx > 0 && equipRefineValues[idx - 1].RefineId === curr.RefineId ? equipRefineValues[idx - 1] : null

        // Ability score; cumulative, not per-level
        const prevFightValue = prevLevel?.FightValue ?? 0
        const FightValue = curr.FightValue - prevFightValue
        
        // Stat gain from refinement level; cumulative, not per-level
        const RefineEffect = curr.RefineEffect.map(([_, attrId, amount], idx) => {
            const [__, prevAttrId, prevAmount] = prevLevel?.RefineEffect[idx] ?? [null, null, 0]
            return `${attrNameMap[attrId]} +${amount - prevAmount}`
        })

        // Bonus stat gain every 5 levels
        const RefineLevelEffect = curr.RefineLevelEffect.map(([_, attrId, amount]) => `${attrNameMap[attrId]} +${amount}`)

        const RefineConsume = curr.RefineConsume.map(([itemId, amount]) => getBriefItemWithAmount([itemId, amount]))
        const ShowCondition = curr.ShowCondition.map(([conditionId, val1]) => text_en[ConditionTable[conditionId].ShowPurview].replace("{*val*}", val1))
        const Condition = curr.Condition.map(([conditionId, val1]) => text_en[ConditionTable[conditionId].ShowPurview].replace("{*val*}", val1))
        const avgAttempts = averageAttempts(curr.SuccessRate / 10000, curr.FailCompensateRate / 10000)

        acc[curr.RefineId].push({
            ...curr,
            FightValue,
            RefineEffect,
            RefineLevelEffect,
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