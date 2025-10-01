import text_en from "$client/Lang/english.json";
import CookMaterialTypeTable from "$client/Tables/CookMaterialTypeTable.json";
import LifeCollectListTable from "$client/Tables/LifeCollectListTable.json";
import LifeProductionListTable from "$client/Tables/LifeProductionListTable.json";
import LifeFormulaTable from "$client/Tables/LifeFormulaTable.json"; // contains talents
import awardsMap from "./awards";
import awardPackagesMap from "./award_packages";
import testCases from "./tests/_test_sources_life_skill";
import { completeCommonData, getBriefItemWithAmount } from "./utils";
import HousingItems from "$client/Tables/HousingItems.json";

// Logic must be revisited if they add more unique talents such as chance to not consume materials

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
    // console.log(recipe.Name$english, `(Talent Lv. ${talentLevel})\n`)

    // Rates for every awardGroup (not every item) should be >= 1
    return recipe.awardGroups.flatMap(awardGroup => {
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

                // if (baseAwards.length > 0 && bonusAwards.length > 0) {
                //     console.log("Base rates\n", baseAwards)
                //     console.log("Bonus rates\n", bonusAwards)
                // }

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

                // if (baseAwards.length > 0 && bonusAwards.length > 0) console.log("Results\n", results, "\n")

                return results
            })

        return yields
    })
        .filter((itemRates) => itemRates.length)
}

function getAwards(recipe) {
    // LifeProduction
    if (Array.isArray(recipe.Award)) {
        return recipe.Award.map(awardId => awardsMap[awardId] ?? awardPackagesMap[awardId])
    }
    // LifeCollect
    const freeAwardGroup = awardPackagesMap[recipe.FreeAward] ?? awardsMap[recipe.FreeAward]
    const result = [freeAwardGroup.map(award => ({ ...award, isFree: true }))]
    if (recipe.Award > 0) {
        const awardGroup = awardsMap[recipe.Award] ?? awardPackagesMap[recipe.Award]
        // Check to make sure our assumption is correct: that Award for LifeCollect will only result in one unique item id which we will use to link to ItemTable
        const uniqItemIds = [...new Set(awardGroup.map(award => award.itemId))]
        if (uniqItemIds.length > 1) console.log(`WARNING: Recipe ${recipe.Id} yields multiple items from Award ${recipe.Award}:`, uniqItemIds)
        result.push(awardGroup)
    }
    return result
}

function getSpecialAwards(recipe) {
    return recipe.SpecialAward.map(([packId, talentId]) => {
        // getYields()'s talentLevel gets the appropriate SpecialAward by index (assumes talents are in order by ascending level)
        // LifeFormulaTable Levels are all set to 1, but they are already in order in the table for now
        const talent = LifeFormulaTable[talentId]
        const { Icon, NeedPoint } = talent
        return {
            ...completeCommonData(talent),
            Icon,
            NeedPoint,
            awards: awardPackagesMap[packId],
        }
    })
}

function getMaterials(recipe) {
    const result = {}
    let mats = recipe.NeedMaterial ?? []

    const furniture = recipe.RelatedItemId && HousingItems[recipe.RelatedItemId]
    if (furniture) {
        const furnitureMats = [...furniture.Consume, furniture.ConsumeCash]
        if (furnitureMats.flat().length > 0) {
            mats = mats.concat(furnitureMats)
        }
        // Ignore furniture.UnlockCondition; the condition is simply to unlock the recipe
        // Not sure what Build and Exist keys do
        result.HousingExp = furniture.Exp
        result.BuildTime = furniture.BuildTime
    }

    result.materials = mats
        // Canned Fish has some materials that are [0, 0]; is this related to custom cooking? Filtering out for now
        .filter(([itemId, amount]) => itemId > 0 && amount > 0)
        .map(([matId, amount]) => {
            switch (recipe.NeedMaterialType) {
                case 1:
                    return getBriefItemWithAmount([matId, amount])
                // Variable materials (Fish Lv.1, etc.) have no sources, but they have options that could have sources
                // TODO: add list of options that fill this slot
                case 2:
                    const material = CookMaterialTypeTable[matId]
                    return { ...material, ...completeCommonData(material), amount }
                default:
                    console.log("Unhandled NeedMaterialType", recipe.NeedMaterialType, `(Recipe ${recipe.Id})`)
            }
        })

    return result
}

// Note: recipes may not always drop the item they represent; i.e. Helmflower recipe does not drop the Helmflower found in ItemTable. 
// Helmflower's item id can be traced through ItemTable → ObtainWayTable → CollectionTable → AwardPackageTable → AwardTable which shows that it exists, but it cannot actually be obtained from gathering Helmflower.
// It's possible that Helmflower requires Focused gathering to obtain since the Award has BindInfo: 1 (unbound); however Focused Helmflower is unavailable as Cost is 0 and Award is 0
export default
    // testCases
    [
        ...Object.values(LifeCollectListTable),
        ...Object.values(LifeProductionListTable)
    ]
        // Needed to get the correct format from the recipe tables
        .map(recipe => ({
            ...recipe,
            awardGroups: getAwards(recipe),
            SpecialAward: getSpecialAwards(recipe)
        }))
        .map(recipe => {
            return {
                ...recipe,
                talent_lv0_yields: getYields(recipe, 0),
                talent_lv1_yields: getYields(recipe, 1),
                talent_lv2_yields: getYields(recipe, 2),
                talent_lv3_yields: getYields(recipe, 3),
            }
        })
        .reduce((acc, curr) => {
            acc[curr.Id] = {
                ...curr,
                ...completeCommonData(curr),
                ...getMaterials(curr)
            }
            return acc
        }, {})