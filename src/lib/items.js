import { completeCommonData, getBriefArr } from "./utils"
import ItemTable from "$client/Tables/ItemTable.json";
import ItemTypeTable from "$client/Tables/ItemTypeTable.json";
import StallDetailTable from "$client/Tables/StallDetailTable.json";
import sourcesMap from "./item_sources";
import usedInMap from "./item_used_in";

// TODO: add sources not in ObtainWayTable (item 31091 Weaving EXP does not have any sources)

// Adds recipes at a depth of 1
const entries = Object.values(ItemTable).map(item => {
    const usedIn = usedInMap[item.Id] ?? []
    const sources = sourcesMap[item.Id] ?? []
    const sellData = StallDetailTable[item.Id] || null
    const sellable = Boolean(sellData)

    return {
        ...item,
        ...completeCommonData(item),
        sellable,
        sellData,
        usedIn,
        sources,
        // storable?,
    }
})

export const entries_brief = getBriefArr(entries)

export default entries