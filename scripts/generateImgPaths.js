import entries from "../json/en/entries.json" with { type: "json" };
import * as fs from "fs";
import { sortAlphabetically } from "../util-functions/sortAlphabetically.js";

// Generate a list of regexes to include in .gitignore to only push the images that are needed (otherwise this shit is like 20gb lmfao)
const regexes = new Set(
    [
        { Icon: "ui/atlas/permanent/item_quality_" },
        { Icon: "ui/atlas/life_profession/life_icon_" },
        ...entries
    ]
    .flatMap(({ Icon, Name }) => {
        const prefix = "!/game/client/Assets/"
        const [first, second] = Icon.split("_")
        if (!first || !second) return null
        // weap_icon folder doesnt exist on any version
        if (Icon.startsWith("ui/atlas/weap_icon/weap")) console.log(Name)
        if (Icon.includes("/")) {
            const split = Icon.split("/")
            const result = []
            for (let i = 1; i < split.length; i++) {
                if (i === split.length - 1) {
                    result.push(prefix + split.slice(0, i).join("/") + "**")
                }
                else {
                    result.push(prefix + split.slice(0, i).join("/"))
                }
            }
            return result
        }

        return `${prefix}${first}_${second}**`;
    })
    .filter((path) => path)
)

fs.writeFileSync("./scripts/imgPaths.txt", sortAlphabetically(["!/game/client/Assets", ...regexes]).join("\n"))