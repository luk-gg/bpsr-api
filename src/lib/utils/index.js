export function getBriefArr(arr) {
    return arr.map(data => getBriefData(data))
}

export function getBriefData(fullData) {
    const { id, name, type, subtypes, elements, icon, role, charId, gender, rarity, category, weak_attribute_damage_up, all_attribute_damage_resist } = fullData || {}
    return { id, name, type, subtypes, elements, icon, role, charId, gender, rarity, category, elePower: weak_attribute_damage_up || all_attribute_damage_resist || undefined }
}