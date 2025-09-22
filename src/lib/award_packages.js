import AwardPackageTable from "$client/Tables/AwardPackageTable.json";
import awardsMap from "./awards";

// [PackageId]: [{ packContent, awards[{ itemId, amount, rate }, ...] }, ...]
function getPackage(pack) {
    return pack.PackContent.map(([awardId, minAmount, maxAmount], contentIndex) => {
        let groupSize = 1;
        let weight = 1;
        switch (pack.RandomRule) {
            case 2:
                groupSize = pack.PackContent.length
                break
            case 3:
                weight = pack.GroupRates[contentIndex] / 10000
                break;
            case 4:
                const totalGroupWeight = pack.GroupWeight.reduce((a, c) => a += c, 0)
                weight = pack.GroupWeight[contentIndex] / totalGroupWeight
                break
        }
        const rate = 1 / groupSize * weight;
        const awards = awardsMap[awardId]

        return {
            awardId,
            rate,
            minAmount,
            maxAmount,
            awards
        }
    })
}

// Flattens package to just show the awards in it, multiplying the rates and min/max of package and each individual reward
// [PackageId]: [{ itemId, amount, rate }, { itemId, amount, rate }]
function getPackageAwards(pack) {
    return getPackage(pack).flatMap(pack => {
        return pack.awards.map(award => {
            const minAmount = pack.minAmount * award.minAmount
            const maxAmount = pack.maxAmount * award.maxAmount
            const rate = pack.rate * award.rate

            return {
                ...award,
                rate,
                minAmount,
                maxAmount,
            }
        })
    })
}

export default Object.entries(AwardPackageTable)
    .reduce((acc, [packId, pack]) => {
        acc[packId] = getPackageAwards(pack)
        return acc
    }, {})