import AwardTable from "$client/Tables/AwardTable.json";
import { getBriefItem } from "./utils";

// Note: amounts are presumably unweighted, so avgAmount is simply (min + max) / 2

// RandomRule 1: give all
// RandomRule 2: give 1, equal chances
// RandomRule 3: give each, individual chances
// RandomRule 4: give 1, weighted
function getAwardDrops(award) {
    if (award.ProItem.length) console.log(award.AwardID)
    return award.GroupContent.map(([itemId, minAmount, maxAmount], contentIndex) => {
        let groupSize = 1;
        let weight = 1;
        switch (award.RandomRule) {
            case 2:
                groupSize = award.GroupContent.length
                break
            case 3:
            case 4:
                // "AwardID": 104 (EXP & Luno) and "AwardID": 10003010 (Pink Musk) have low GroupWeights; 
                // However, at least one award is guaranteed (you can't gather and get nothing)
                // Assume that weights will not always add up to 100%; use individualRate / totalGroupWeight
                const totalGroupWeight = award.GroupWeight.reduce((a, c) => a += c, 0)
                weight = award.GroupWeight[contentIndex] / totalGroupWeight
                break
        }

        const rate = 1 / groupSize * weight;

        const { Name, Icon, Quality } = getBriefItem(itemId)

        return {
            itemId,
            Name,
            rate,
            minAmount,
            maxAmount,
            Icon,
            Quality,
        }
    })
}

export default Object.entries(AwardTable)
    .reduce((acc, [awardId, award]) => {
        acc[awardId] = getAwardDrops(award)
        return acc
    }, {})