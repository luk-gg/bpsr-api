import text_en from "$client/Lang/english.json";

export function getBriefArr(arr) {
    return arr.map(data => getBriefData(data))
}

export function getBriefData(fullData) {
    const { Id, Name, Type, Icon, Cost, NeedLevel, Quality } = fullData || {}
    return { Id, Name: typeof Name === "number" ? text_en[Name] : Name, Type, Icon, Cost, NeedLevel, Quality }
}