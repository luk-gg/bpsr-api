import text_en from "$client/Lang/english.json";
import attrDescription from "$client/Tables/AttrDescription.json";
import fightAttrTable from "$client/Tables/FightAttrTable.json";
import modEffectTable from "$client/Tables/ModEffectTable.json";
import professionSystemTable from "$client/Tables/ProfessionSystemTable.json";
import skillTable from "$client/Tables/SkillTable.json";
import talentStageTable from "$client/Tables/TalentStageTable.json";
import talentTable from "$client/Tables/TalentTable.json";
import talentTreeTable from "$client/Tables/TalentTreeTable.json";
import { formatConditions, formatItemCost } from "./utils";
/** @import { ProfessionSystemTable, FightAttrTable, TalentStageTable, TalentTable, TalentTreeTable, ItemTable, AttrDescription, SkillTable, ModEffectTable } from '../../game/client/Tables' */

/** @type {Record<string, ProfessionSystemTable>} */
const professions = professionSystemTable
/** @type {Record<string, FightAttrTable>} */
const fightAttrs = fightAttrTable
/** @type {Record<string, TalentStageTable>} */
const talentStages = talentStageTable
/** @type {Record<string, TalentTreeTable>} */
const talentNodes = talentTreeTable
/** @type {Record<string, TalentTable>} */
const talents = talentTable
/** @type {Record<string, AttrDescription>} */
const attrDescs = attrDescription
/** @type {Record<string, SkillTable>} */
const skills = skillTable
/** @type {Record<string, ModEffectTable>} */
const modEffects = modEffectTable
const conversionLookUp = {
    0: "Strength",
    2: "Agility",
    3: "Intelligence"
}
/** @type {Record<string, string>} */
const weaponTypeLookUp = Object.entries(professions).reduce((prev, [id, value]) => ({
    ...prev,
    [id]: text_en[value.Name]
}), {})

/** @type {Record<string, string>} */
const modEffectLookUp = Object.entries(modEffects).reduce((prev, [id, value]) => ({
    ...prev,
    [value.EffectID]: text_en[value.EffectName]
}), {})

/** @type {Record<string, string>} */
const attrLookUp = Object.entries(fightAttrs).reduce((prev, [id, value]) => {
    if (value.AttrFinal) {
        const name = text_en[value.OfficialName] || value.EnumName
        return {
            ...prev,
            [value.AttrFinal]: `${name}`,
            [value.AttrTotal]: `Total ${name}`,
            [value.AttrAdd]: `${name}+`,
            [value.AttrExAdd]: `Extra ${name}+`,
            [value.AttrPer]: `${name}%+`,
            [value.AttrExPer]: `Extra ${name}%+`,
        }
    }
    return {
        ...prev,
        [id]: text_en[value.OfficialName] || value.EnumName
    }
}, {})


/**
 * @param {number} currentId
 * @param {number[]} walked
 * @param {number[]} queue
 * @returns {number[]}
 */
function walk(currentId, walked, queue) {
    talentNodes[currentId].NextTalent.forEach(id => {
        if (!walked.includes(id) && !queue.includes(id)) {
            queue.push(id)
        }
    })
    walked.push(currentId)
    const next = queue.shift()
    if (next) {
        return walk(next, walked, queue)
    }
    return walked
}

/**
 * @param {number} rootId
 * @returns {TalentTreeTable[]}
 */
function walkTalent(rootId) {
    return walk(rootId, [], []).map(id => talentNodes[id])
}

export default Object.values(talentStages).map(stage => ({
    name: `${weaponTypeLookUp[stage.WeaponType]} - ${stage.Name$english.join(", ")}`,
    desc: text_en[stage.MainDesShow],
    talentNodes: walkTalent(stage.RootId).map(node => {
        const talent = talents[node.TalentId]
        return {
            id: node.Id,
            name: text_en[talent.TalentName],
            desc: text_en[talent.TalentDes],
            icon: talent.TalentIcon,
            recommended: stage.RecommendTalent.includes(node.Id),
            unlockPoint: talent.TalentPointsConsume,
            unlockItems: formatItemCost(talent.UnlockConsume),
            condition: formatConditions(node.Unlock),
            gearScore: talent.FightValue,
            talentLevel: talent.TalentLevel,
            effect: talent.TalentEffect.map(([predicate, ...param]) => {
                switch (predicate) {
                    case 1:
                        return `${attrLookUp[param[0]]} ${param[1]}`
                    case 3:
                        return text_en[attrDescs[param[0]].Description]
                    case 4:
                        return `Each ${conversionLookUp[param[0]]} grants ${attrLookUp[param[1]]} ${(param[2] / 10000)}`
                    case 6:
                        return `Replaces ${text_en[skills[param[0]].Name]} with ${text_en[skills[param[1]].Name]}`
                    default:
                        return ''
                }
            }).filter(x => !!x),
            nodePos: node.TalentPosition,
            nodeLink: node.NextTalent
        }
    }),
    mainAttributes: stage.MainAttrShow.map(x => attrLookUp[x]),
    mainSkills: stage.MainSkillShow.map(x => {
        const skill = skills[x]
        return {
            id: x,
            name: text_en[skill.Name],
            desc: text_en[skill.Desc],
            icon: skill.Icon
        }
    }),
    recommendedEffects: stage.RecommendModEffectId.map(x => modEffectLookUp[x]),
    recommendedAttrs: stage.RecommendAttrList.map(x => attrLookUp[x])
}))