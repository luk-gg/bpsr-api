import LifeExpTable from "$client/Tables/LifeExpTable.json";

// Assumes the levels are in order, not [Lv. 2, Lv. 1, Lv 3]
export default Object.values(LifeExpTable)
    .reduce((acc, curr) => {
        if (!acc[curr.ProId]) acc[curr.ProId] = []
        acc[curr.ProId].push(curr.Exp[1] ?? null)
        return acc
    }, {})