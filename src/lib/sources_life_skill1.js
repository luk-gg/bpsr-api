import text_en from "$client/Lang/english.json";
import LifeCollectListTable from "$client/Tables/LifeCollectListTable.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";
import LifeFormulaTable from "$client/Tables/LifeFormulaTable.json";
import AwardTable from "$client/Tables/AwardTable.json";
import ItemTable from "$client/Tables/ItemTable.json";
import awardsMap from "./awards";
import awardPackagesMap from "./award_packages";
import convolve from "convolution";


LifeFormulaTable.fakeTalent = {
    "Name$english": "GOD TIER CRAFTING HEPHAESTUS",
}

awardsMap.mergedAwards = [
    // Awards 1
    {
        "itemId": 1022101,
        "rate": 0.8,
        "minAmount": 1,
        "maxAmount": 1,
    },
    {
        "itemId": 1022101,
        "rate": 0.2,
        "minAmount": 2,
        "maxAmount": 2,
    },
    // Awards 2
    {
        "itemId": 1012012,
        "rate": 0.5,
        "minAmount": 1,
        "maxAmount": 1,
    },
    {
        "itemId": 1012013,
        "rate": 0.4,
        "minAmount": 1,
        "maxAmount": 1,
    },
    {
        "itemId": 1012014,
        "rate": 0.1,
        "minAmount": 1,
        "maxAmount": 1,
    }
]

awardsMap.duplicateAwardIds = [
    // Award 1
    {
        "itemId": 1022101,
        "rate": 0.55,
        "minAmount": 1,
        "maxAmount": 1,
    },
    {
        "itemId": 1022101,
        "rate": 0.35,
        "minAmount": 2,
        "maxAmount": 2,
    },
    {
        "itemId": 1022101,
        "rate": 0.05,
        "minAmount": 3,
        "maxAmount": 3,
    },
    {
        "itemId": 1022101,
        "rate": 0.05,
        "minAmount": 4,
        "maxAmount": 4,
    },
    // Award 2
    {
        "itemId": 1012012,
        "rate": 0,
        "minAmount": 1,
        "maxAmount": 1,
    },
    {
        "itemId": 1012013,
        "rate": 0.5,
        "minAmount": 1,
        "maxAmount": 1,
    },
]

awardPackagesMap.mergedAwardPackages = [
    {
        "itemId": 1022101,
        "rate": 0.15,
        "minAmount": 1,
        "maxAmount": 1,
    },
    // Fake Lv.4 talent to simulate adding TWO
    {
        "itemId": 1022101,
        "rate": 0.30,
        "minAmount": 2,
        "maxAmount": 2,
    },
    {
        "itemId": 1022101,
        "rate": 0.05,
        "minAmount": 10,
        "maxAmount": 10,
    },
    {
        "itemId": 1012012,
        "rate": 0.15,
        "minAmount": 1,
        "maxAmount": 1,
    },
    {
        "itemId": 1012013,
        "rate": 0.12,
        "minAmount": 1,
        "maxAmount": 1,
    },
    {
        "itemId": 1012014,
        "rate": 0.03,
        "minAmount": 1,
        "maxAmount": 1,
    }
]

const production = [
    // {
    //     "Id": 2030006,
    //     "Name$english": "Mystery Metal - Beginner",
    //     "Award": [
    //         21100010 // Metal (x1) or Metal (x2)
    //     ],
    //     "SpecialAward": [
    //         [
    //             21100011, // 5% chance of +1 Metal
    //             203012
    //         ],
    //         [
    //             21100012, // 10% chance of +1 Metal
    //             203013
    //         ],
    //         [
    //             21100013, // 15% chance of +1 Metal
    //             203014
    //         ]
    //     ],
    // },
    // {
    //     "Id": 2010055,
    //     "Name$english": "Meatfish Skewer",
    //     "Award": [
    //         21400223 // Lv.1 (x1), Lv.2 (x1), or Lv.3 (x1) dish
    //     ],
    //     "SpecialAward": [
    //         [
    //             21400220, // 10% chance of +1 Lv. 1/2/3 (50%/40%/10%)
    //             201015
    //         ],
    //         [
    //             21400221, // 20% chance of +1 Lv. 1/2/3 (50%/40%/10%)
    //             201016
    //         ],
    //         [
    //             21400222, // 30% chance of +1 Lv. 1/2/3 (50%/40%/10%)
    //             201017
    //         ]
    //     ],
    // },
    {
        "Id": 2010055,
        "Name$english": "Frankenstein",
        "Award": [
            "mergedAwards",
            "duplicateAwardIds",
        ],
        "SpecialAward": [
            [
                "mergedAwardPackages",
                "fakeTalent"
            ],
            [
                "mergedAwardPackages",
                "fakeTalent"
            ],
            [
                "mergedAwardPackages",
                "fakeTalent"
            ],
        ],
    },
]

function getYields(recipe, talentLevel) {
    const talent = recipe.SpecialAward[talentLevel - 1] ?? { awards: [] }
    console.log(recipe.Name$english, `(Talent Lv. ${talentLevel})`)

    // Rates for every AwardGroup (not every item) should be >= 1
    return recipe.AwardGroups.map(awardGroup => {
        const uniqItemIds = new Set(awardGroup.concat(talent.awards).map(({ itemId }) => itemId))


        

        // Every unique item has base rates and bonus rates
        const yields = [...uniqItemIds]
            .map(uniqItemId => {
                const baseAwards = awardGroup.filter(({ itemId }) => itemId === uniqItemId)
                const bonusAwards = talent.awards.filter(({ itemId }) => itemId === uniqItemId)
                const baseRates = baseAwards.map(({ rate }) => rate)
                const bonusRates = bonusAwards.map(({ rate }) => rate)

                let finalRates = baseRates
                let amounts = baseAwards
                let out = []

                // The game's current implementation of talents is that Lv. 2 overrides Lv. 1, thus there should only be one bonus rate.
                // If multiple bonus rates were to exist for the same item (i.e. +1 and +2), the code below treats them independently--the maximum bonus would be +3.
                // This will NOT cover cases of sequential rolls, i.e. only attempt +1 if +2 failed.
                // Rates of 0 will be convolved to zero; the bonus will NOT be applied via addition. This means a case of "0 rewards base, but 15% chance for +1" is not possible in the current implementation, however RNG for such a case would exist in the AwardTable level to begin with.
                bonusAwards.forEach((bonusAward, bonusIndex) => {
                    finalRates = convolve(finalRates, [1-bonusAward.rate, bonusAward.rate])
                    // console.log(finalRates)
                    if (baseAwards.length) {
                        amounts = finalRates.map((rate, index) => {
                        const original = amounts[index]
                        if (amounts[index]) {
                            return { ...original, rate }
                        }

                        const prev = baseAwards[baseAwards.length-1]

                        return {
                            ...prev,
                            rate,
                            minAmount: prev.minAmount + bonusAward.minAmount,
                            maxAmount: prev.maxAmount + bonusAward.maxAmount,
                        }
                    })
                    }
                    
                })

                

                // a, b, a+b
                // a, b, c, a+b, a+c, b+c
                const finalAwards = finalRates.map((rate, index) => {
                    if (index < baseAwards.length) {
                        baseAwards[index]
                    }
                })

                console.log("item:", uniqItemId, "rates:", baseRates, "bonuses:", bonusRates, "final:", finalRates)
                console.log(amounts)

                return {

                }
            })
        console.log()
        return yields
    })


}


function getAwards(recipe) {
    return recipe.Award.map(awardId => awardsMap[awardId] ?? awardPackagesMap[awardId])
}

function getSpecialAwards(recipe) {
    return recipe.SpecialAward.map(([packId, talentId]) => ({
        // LifeFormulaTable Levels are all set to 1... however they are sorted in order by id
        talent: LifeFormulaTable[talentId].Name$english,
        awards: awardPackagesMap[packId],
    }))
}

export default production
    // Replace award ids with rates and amounts, and append talent conditions
    .map(recipe => ({
        ...recipe,
        AwardGroups: getAwards(recipe),
        SpecialAward: getSpecialAwards(recipe)
    }))
    .map(recipe => {
        return {
            ...recipe,
            talent_lv3_yields: getYields(recipe, 3),
        }
    })