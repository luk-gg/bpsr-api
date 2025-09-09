import text_en from "$client/Lang/english.json";
import bdTagTable from "$client/Tables/BdTagTable.json";
import damageAttrTable from "$client/Tables/DamageAttrTable.json";
import professionSystemTable from "$client/Tables/ProfessionSystemTable.json";
import skillEffectTable from "$client/Tables/SkillEffectTable.json";
import skillFightLevelTable from "$client/Tables/SkillFightLevelTable.json";
import skillSystemTable from "$client/Tables/SkillSystemTable.json";
import skillTable from "$client/Tables/SkillTable.json";
import skillUpgradeTable from "$client/Tables/SkillUpgradeTable.json";
import weaponStarTable from "$client/Tables/WeaponStarTable.json";
import { formatConditions, formatItemCost } from "./utils";
/** @import { BdTagTable, DamageAttrTable, ProfessionSystemTable, SkillEffectTable, SkillFightLevelTable, SkillSystemTable, SkillTable, SkillUpgradeTable, WeaponStarTable } from '../../game/client/Tables' */

/** @type {Record<string, ProfessionSystemTable} */
const professions = professionSystemTable
/** @type {Record<string, SkillTable} */
const skills = skillTable
/** @type {Record<string, SkillEffectTable} */
const skillEffects = skillEffectTable
/** @type {Record<string, DamageAttrTable} */
const damageAttrs = damageAttrTable
/** @type {Record<string, SkillFightLevelTable>} */
const skillFightLevels = skillFightLevelTable
/** @type {Record<string, BdTagTable>} */
const bdTags = bdTagTable
/** @type {Record<string, SkillSystemTable>} */
const skillSystem = skillSystemTable
/** @type {Record<string, SkillUpgradeTable>} */
const skillUpgrades = skillUpgradeTable
/** @type {Record<string, WeaponStarTable>} */
const skillAdvances = weaponStarTable

const upgradeMap = Object.values(skillUpgrades).reduce((acc, upgradeEntry) => {
    if (!acc[upgradeEntry.UpgradeId]) {
        acc[upgradeEntry.UpgradeId] = []
    }
    acc[upgradeEntry.UpgradeId].push({
        level: upgradeEntry.SkillLevel,
        cost: formatItemCost(upgradeEntry.Cost),
        conditions: formatConditions(upgradeEntry.UnlockConditions)
    })
    return acc
}, {})

const advanceMap = Object.values(skillAdvances).reduce((acc, advanceEntry) => {
    if (!acc[advanceEntry.SkillId]) {
        acc[advanceEntry.SkillId] = []
    }
    acc[advanceEntry.SkillId].push({
        name: text_en[advanceEntry.Name],
        desc: text_en[advanceEntry.Des],
        level: advanceEntry.Level,
        cost: formatItemCost(advanceEntry.UpgradeCost),
        conditions: formatConditions(advanceEntry.UlockSkillLevel),
        gearScore: advanceEntry.FightValue
    })
    return acc
}, {})

/** @param {number} effectId */
function getFloatParams(effectId) {
    return Object.values(skillFightLevels).filter(sfl => sfl.SkillEffectId === effectId).map(sfl => sfl.FloatParameter).reduce((acc, entry) => {
        entry.forEach((attribute) => {
            if (!acc[attribute[0]]) {
                acc[attribute[0]] = []
            }
            acc[attribute[0]].push(parseInt(attribute[1]))
        })
        return acc
    }, {})
}

/** @param {string} desc */
/** @param {Record<string, number[]>} floatParams */
function formatAttrDesc(desc, floatParams) {
    if (!desc) {
        return { desc }
    }
    const functionMatcher = /{\*(?<funcName>.*?)\((?<params>.*?)\)\*}/gm
    const paramsMatcher = /\{(?<match>[^}]*)\}|\((?<match>[^)]*)\)|"(?<match>[^"]*)"|(?<match>[^,(){}]+)/gm
    let params = []
    let tags = new Set()
    for (const call of desc.matchAll(functionMatcher)) {
        const funcName = call.groups["funcName"].trim()
        const args = [...call.groups["params"].matchAll(paramsMatcher)].map(x => x.groups["match"])
        switch (funcName) {
            case 'skillpara.damageMerge':
                const damageAttrKeys = args[1].split(",")
                params.push({
                    indexKey: args[3],
                    isPercentage: args[2].toLowerCase().includes("radio"),
                    array: args[0].split(",").map((damageAttrId, idx) => {
                        const damageAttr = damageAttrs[damageAttrId]
                        if (damageAttr) {
                            damageAttr.Tags.forEach(tagId => tags.add(tagId))
                            return { type: damageAttrKeys[idx], data: damageAttr[args[2]] }
                        }
                        return {}
                    })
                })
                break
            case 'skillpara.effect':
                params.push({
                    indexKey: args[1],
                    isPercentage: args[0].toLowerCase().includes("per"),
                    array: { data: floatParams[args[0]] }
                })
                break
            default:
                console.log(`Unhandled formatting function: ${funcName} with args: ${args}`)
                break
        }
    }

    return { desc: desc.replaceAll(functionMatcher, "{}"), params, tags: [...tags].map(tagId => formatTag(bdTags[tagId])) }
}

/** @param {BdTagTable} tag */
function formatTag(tag) {
    return {
        name: text_en[tag.TagName],
        desc: text_en[tag.TagString]
    }
}

/** @param {SkillTable} skill */
function formatSkill(skill) {
    let upgradeCost
    const skillUpgradeKey = skillSystem[skill.Id]
    if (skillUpgradeKey) {
        upgradeCost = upgradeMap[skillUpgradeKey.UpgradeId]
    }

    return {
        name: text_en[skill.Name],
        desc: text_en[skill.Desc],
        icon: skill.Icon,
        upgradeCost,
        advanceCost: advanceMap[skill.Id],
        effects: skill.EffectIDs.map(effectId => skillEffects[effectId]).map(effect => ({
            tags: effect.Tags.map((tagId) => formatTag(bdTags[tagId])),
            desc: effect.SkillAttrDes$hash.map(([nameHash, descHash]) => ({
                name: text_en[nameHash],
                ...formatAttrDesc(text_en[descHash], getFloatParams(effect.Id))
            }))
        }))
    }
}

export default Object.values(professions).map(profession => ({
    name: text_en[profession.Name],
    normalAttackSkill: formatSkill(skills[profession.NormalAttackSkill]),
    specialSkill: formatSkill(skills[profession.SpecialSkill]),
    ultimateSkill: formatSkill(skills[profession.UltimateSkill]),
    normalSkills: profession.NormalSkill.map(skillId => formatSkill(skills[skillId])),
    talentSkills: profession.TalentSkill.map(skillId => formatSkill(skills[skillId])),
}))