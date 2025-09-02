import text_en from "$client/Lang/english.json";
import UnionUpradingTable from "$client/Tables/UnionUpradingTable.json"
import UnionUpradingPurviewTable from "$client/Tables/UnionUpradingPurviewTable.json"

export default Object.values(UnionUpradingTable)
    .map((building) => {
        let upgradeDescription = ""
        let reqGuildCenterLv = 0
        let reqExp = 0
        let cost = 0
        const name = text_en[building.Comment]
        const level = building.Level

        if (building.Purview.length > 0) {
            const [purviewId, purviewVal1, purviewVal2] =  building.Purview[0]
            upgradeDescription = text_en[UnionUpradingPurviewTable[purviewId].ShowPurview]
                .replace(/\{\*(val1?|val)\*\}/g, building.BuildingId === 4 ? purviewVal1 + 80 : purviewVal1)
                .replace("{*val2*}", purviewVal2)
        }

        if (building.UpgradingLimits.length > 0 && building.UpgradingLimits[0][0] === 1) {
            reqGuildCenterLv = building.UpgradingLimits[0][1]
        }

        if (building.UnionBankroll.length > 0) {
            cost = building.UnionBankroll[1]
        }

        if (building.UnionExp.length > 0) {
            reqExp = building.UnionExp[1]
        }
        
        return {
            // ...building,
            buildingId: building.BuildingId,
            name,
            level,
            upgradeDescription,
            reqGuildCenterLv,
            cost,
            reqExp
        }
    })
    .sort((a, b) => a.BuildingId - b.BuildingId)