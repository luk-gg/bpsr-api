import text_en from "$client/Lang/english.json";
import talentTable from "$client/Tables/TalentTable.json"
import talentStageTable from "$client/Tables/TalentStageTable.json"
import professionSystemTable from "$client/Tables/ProfessionSystemTable.json"
import fightAttrTable from "$client/Tables/FightAttrTable.json"
import talentTreeTable from "$client/Tables/TalentTreeTable.json"
import itemTable from "$client/Tables/ItemTable.json"
import attrDescription from "$client/Tables/AttrDescription.json"
import skillTable from "$client/Tables/SkillTable.json"
import modEffectTable from "$client/Tables/ModEffectTable.json"
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
/** @type {Record<string, ItemTable>} */
const items = itemTable
/** @type {Record<string, AttrDescription>} */
const attrDescs = attrDescription
/** @type {Record<string, SkillTable>} */
const skills = skillTable
/** @type {Record<string, ModEffectTable>} */
const modEffects = modEffectTable
const conversionLookUp = {
    0: "Strength",
    1: "Stamina",
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
            name: text_en[talent.TalentName],
            desc: text_en[talent.TalentDes],
            icon: talent.TalentIcon,
            recommended: stage.RecommendTalent.includes(node.Id),
            unlockPoint: talent.TalentPointsConsume,
            unlockItems: talent.UnlockConsume.map(([itemId, amount]) => {
                const item = items[itemId]
                return [{
                    name: text_en[item.Name],
                    desc: text_en[item.Description],
                    desc_ext: text_en[item.Description2],
                    icon: item.Icon,
                    icon2: item.Icon2,
                    type: item.Type
                }, amount]
            }),
            condition: node.Unlock.map(([predicate, ...param]) => {
                switch (predicate) {
                    case 3:
                        return `${param[0]} Talent Points spent`
                    default:
                        return ''
                }
            }),
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
            }).filter(x => !!x)
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