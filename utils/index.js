// Uses linear interpolation to incrementally add missing values to an UnrealEngine array of [{ Time, Value }] objects and return them as [{ x, y }]
export function RCIM_Linear(arr) {
    return arr.reduce((acc, curr, index) => {
        let { Time: x0, Value: y0 } = curr
        const { Time: x1, Value: y1 } = arr[index + 1] || {}

        // Push the current value from the original array
        acc.push({ x: x0, y: y0 })

        // Fill in missing values from the current Time to the next Time
        let missingX = x0
        while (x1 > missingX + 1) {
            missingX++
            const missingY = y0 + (y1 - y0) * ((missingX - x0) / (x1 - x0))
            acc.push({ x: missingX, y: missingY })
        }

        return acc
    }, [])
}

export function imgPath(path) {
    if (!path) return
    return path.replace("/Game", "/Content").split(".")[0] + ".png"
}

// Split-pop function for removing Unreal Engine variable types, i.e. "ESkillType::Attack" → "Attack".
export const sp = (str, delimiter = "::") => str.split(delimiter).pop()

export function sortAlphabetically(data, key = null) {
    return data.sort(function (a, b) {
        if (key) {
            if (a[key] < b[key]) return -1;
            if (a[key] > b[key]) return 1;
        }
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });
}