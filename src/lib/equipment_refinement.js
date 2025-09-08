import equipRefineTable from '$client/Tables/EquipRefineTable.json';
import itemTable from '$client/Tables/ItemTable.json';
import conditionTable from '$client/Tables/ConditionTable.json';
import equipPartTable from '$client/Tables/EquipPartTable.json';
import fightAttrTable from '$client/Tables/FightAttrTable.json';
/** @import { EquipRefineTable, ItemTable, ConditionTable, EquipPartTable, FightAttrTable } from '../../game/client/Tables' */

/** @type {Record<string, EquipRefineTable>} */
const equipRefines = equipRefineTable;
/** @type {Record<string, ItemTable>} */
const items = itemTable;
/** @type {Record<string, ConditionTable>} */
const conditions = conditionTable;
/** @type {Record<string, EquipPartTable>} */
const equipParts = equipPartTable;
/** @type {Record<string, FightAttrTable>} */
const fightAttrs = fightAttrTable;

/** @type {Record<string, string>} */
const itemMap = Object.values(items).reduce((acc, item) => {
    if (item?.Id && item?.['Name$english']) acc[item.Id] = item['Name$english'];
    return acc;
}, {});

/** @type {Record<string, string>} */
const fightAttrMap = Object.values(fightAttrs).reduce((acc, attr) => {
    if (attr?.AttrAdd && attr?.['OfficialName$english']) {
        acc[attr.AttrAdd] = attr['OfficialName$english'].replace(/\u200b/g, '').trim();
    }
    return acc;
}, {});

/** @type {Record<string, string>} */
const idMap = { ...itemMap, ...fightAttrMap };

/** @type {Record<string, string>} */
const conditionMap = Object.values(conditions).reduce((acc, cond) => {
    if (cond?.Type && cond?.['ShowPurview$english']) {
        acc[cond.Type] = cond['ShowPurview$english'];
    }
    return acc;
}, {});

/** @type {Record<string, string>} */
const refineIdToGearMap = Object.values(equipParts).flatMap(part =>
    (part.RefineId || []).map(ref => ref[1] && [ref[1], part['PartName$english']])
).reduce((acc, pair) => {
    if (pair) acc[pair[0]] = pair[1];
    return acc;
}, {});

/** @type {Record<string, string>} */
const resolveId = (id, map, unknownPrefix = 'Unknown ID') => map[id] || `${unknownPrefix}: ${id}`;

export default Object.values(equipRefines).map(entry => {
    const gearName = refineIdToGearMap[entry.RefineId] || `Unknown Gear (RefineId: ${entry.RefineId})`;

    const mapEffect = arr => (arr || []).map(e => e.length > 2 ? [resolveId(e[1], idMap), e[2]] : e.length > 1 ? [resolveId(e[1], idMap), e[0]] : e);

    const mapCondition = arr => (arr || []).map(c => {
        if (c.length > 1) {
            const [condId, condVal] = c;
            return (conditionMap[condId] || `Unknown Condition ID: ${condId}`).replace('{*val*}', condVal.toString());
        }
        return null;
    }).filter(Boolean);

    const mapConsume = arr => (arr || []).map(c => c.length > 0 ? [resolveId(c[0], idMap, 'Unknown Item ID'), ...c.slice(1)] : c);

    return {
        RefineGear: gearName,
        RefineLevel: entry.RefineLevel,
        RefineEffect: mapEffect(entry.RefineEffect),
        RefineLevelEffect: mapEffect(entry.RefineLevelEffect),
        BuffPar: entry.BuffPar || [],
        ShowCondition: mapCondition(entry.ShowCondition),
        Condition: mapCondition(entry.Condition),
        RefineConsume: mapConsume(entry.RefineConsume),
        SuccessRate: entry.SuccessRate,
        FailCompensateRate: entry.FailCompensateRate,
        FightValue: entry.FightValue,
    };
})
    .sort((a, b) => a.RefineGear.localeCompare(b.RefineGear) || ((a.RefineLevel || 0) - (b.RefineLevel || 0)));
