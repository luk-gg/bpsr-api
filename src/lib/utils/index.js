export function getBriefArr(arr) {
    return arr.map(data => getBriefData(data))
}

export function getBriefData(fullData) {
    const { Id, Name, Icon, Cost, NeedLevel } = fullData || {}
    return { Id, Name, Icon, Cost, NeedLevel }
}