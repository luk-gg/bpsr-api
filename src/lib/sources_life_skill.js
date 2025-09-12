import text_en from "$client/Lang/english.json";
import LifeCollectListTable from "$client/Tables/LifeCollectListTable.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";
import LifeFormulaTable from "$client/Tables/LifeFormulaTable.json";
import awardsMap from "./awards";
import awardPackagesMap from "./award_packages";
import testCases from "./tests/_test_sources_life_skill";

// Spreads an item of { min 1, max 5 } to 5 items: { amount 1 }, ... { amount 5 },
function expandAmounts(items) {
    const expanded = new Map();
    // console.log("Input\n", items)

    for (const item of items) {
        for (let amount = item.minAmount; amount <= item.maxAmount; amount++) {
            // Min~max amount ranges are presumed unweighted/equal chance so simply divide by length
            const rate = item.rate / (item.maxAmount - item.minAmount + 1)
            if (expanded.has(amount)) {
                expanded.get(amount).rate += rate;
            } else {
                expanded.set(amount, { ...item, rate, amount });
            }
        }
    }

    return [...expanded.values()]
        .map((item) => {
            delete item.minAmount
            delete item.maxAmount
            return item
        })
}

function getYields(recipe, talentLevel) {
    const talent = recipe.SpecialAward[talentLevel - 1] ?? { awards: [] }
    console.log(recipe.Name$english, `(Talent Lv. ${talentLevel})\n`)

    // Rates for every AwardGroup (not every item) should be >= 1
    return recipe.AwardGroups.flatMap(awardGroup => {
        const uniqItemIds = new Set(awardGroup.concat(talent.awards).map(({ itemId }) => itemId))

        // Every unique item has base rates and bonus rates
        const yields = [...uniqItemIds]
            .map(uniqItemId => {
                const baseAwards = expandAmounts(
                    awardGroup.filter(({ itemId }) => itemId === uniqItemId)
                )

                const bonusAwards = expandAmounts(
                    talent.awards.filter(({ itemId }) => itemId === uniqItemId)
                )

                if (baseAwards.length > 0 && bonusAwards.length > 0) {
                    console.log("Base rates\n", baseAwards)
                    console.log("Bonus rates\n", bonusAwards)
                }

                let results = baseAwards;

                // The game's current implementation of talents is that Lv. 2 overrides Lv. 1, thus there should only be one bonus rate.
                // If multiple bonus rates were to exist for the same item (i.e. +1 and +2), the code below treats them independently--the maximum bonus would be +3.
                // This will NOT cover cases of sequential rolls, i.e. only attempt +1 if +2 failed.
                // Rates of 0 will be convolved to zero; the bonus will NOT be applied via addition. This means a case of "0 rewards base, but 15% chance for +1" is not possible in the current implementation, however RNG for such a case would exist in the AwardTable level to begin with.
                bonusAwards.forEach((bonusAward) => {
                    const newResults = new Map();
                    const addResult = item => {
                        const key = item.amount;
                        if (newResults.has(key)) {
                            newResults.get(key).rate += item.rate;
                        } else {
                            newResults.set(key, item);
                        }
                    };

                    // Add results assuming that the talent did not activate
                    for (const original of results) {
                        addResult({
                            ...original,
                            rate: (1 - bonusAward.rate) * original.rate
                        });
                    }

                    // Add results assuming that the talent did activate
                    for (const original of results) {
                        addResult({
                            ...original,
                            rate: bonusAward.rate * original.rate,
                            // minAmount: original.minAmount + bonusAward.minAmount,
                            // maxAmount: original.maxAmount + bonusAward.maxAmount,
                            amount: original.amount + bonusAward.amount
                        });
                    }

                    results = [...newResults.values()];

                })

                // console.log("item:", uniqItemId, "rates:", baseAwards.map(({ rate }) => rate), "bonuses:", bonusAwards.map(({ rate }) => rate), "final:", results)

                if (baseAwards.length > 0 && bonusAwards.length > 0) console.log("Results\n", results, "\n")

                return results
            })

        return yields
    })
    .filter((itemRates) => itemRates.length)
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

export default testCases
    // Needed to get the correct format from the recipe tables
    // .map(recipe => ({
    //     ...recipe,
    //     AwardGroups: getAwards(recipe),
    //     SpecialAward: getSpecialAwards(recipe)
    // }))
    .map(recipe => {
        return {
            ...recipe,
            talent_lv0_yields: getYields(recipe, 0),
            talent_lv1_yields: getYields(recipe, 1),
            talent_lv2_yields: getYields(recipe, 2),
            talent_lv3_yields: getYields(recipe, 3),
        }
    })