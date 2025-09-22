import ConditionTable from "$client/Tables/ConditionTable.json";
import MessageTable from "$client/Tables/MessageTable.json";
import LifeFormulaTable from "$client/Tables/LifeFormulaTable.json";
import LifeProfessionTable from "$client/Tables/LifeProfessionTable.json";
import text_en from "$client/Lang/english.json";

export function getConditions(conditions) {
    if (!conditions) return
    return conditions.map((condition) => {
        if (typeof condition === "string") return condition // already been processed
        const [conditionType, ...params] = condition
        
        switch (conditionType) {
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
                const skill = SkillTable[params[0]]
                params[0] = text_en[skill.Name]
                break
            case 58:
                const profession = LifeProfessionTable[params[0]]
                params[0] = text_en[profession.Name]
                break
            case 59:
                const talent = Object.values(LifeFormulaTable).find(talent => talent.GroupId === params[0])
                params[0] = text_en[talent.Name]
            case 45:
            case 60:
                break
            default:
                console.log("Unknown Condition:", [conditionType, ...params])
                return [conditionType, ...params]
        }

        const text = allConditions[conditionType]
        const regex = /\{\*([^*]+)\*\}/g
        let index = 0;
        return text.replace(regex, (match) => params[index++] || match)
    })
}

const allConditions = Object.values(ConditionTable)
    .reduce((acc, condition) => {
        const conditionPreviewText = text_en[condition.ShowPurview]
        const message = MessageTable[condition.FailureMessage]
        const messageText = text_en[message?.Content]
        acc[condition.Type] = messageText ?? conditionPreviewText ?? condition.Param
        return acc
    }, {})

export default allConditions