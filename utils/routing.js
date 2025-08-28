import path from "path"
import fs from "fs"
import { json } from '@sveltejs/kit'

export const getEndpoint = async ({ params }) => {
    if (params.file === "favicon.ico") return json({})
    const { default: file } = await import(`../src/lib/${params.file}.js`)
    return json(file)
}

export const writeAllEndpoints = async () => {
    const allFiles = import.meta.glob("/src/lib/*.js")

    for (const [filePath, resolver] of Object.entries(allFiles)) {
        const fileData = await resolver()
        const fileName = path.basename(filePath, ".js")

        // If the file has an entries_brief export, then the default export is the detailed version
        if (fileData.entries_brief) {
            console.log(fileName, "(multiple entries)")

            // Write the entries_brief to a single json
            writeJson(`./json/en`, fileName, fileData.entries_brief)

            // Write the default export as individual json files
            for (const obj of fileData.default) {
                writeJson(`./json/en/${fileName}`, obj.id, obj)
            }
        }
        else {
            console.log(fileName)
            writeJson(`./json/en`, fileName, fileData.default)
        }
    }

    return json({})
}

export const loadAllEndpoints = () => {
    const files = import.meta.glob("/src/lib/*.js")
    const links = Object.keys(files).map(filePath => "/" + path.basename(filePath, ".js"));
    return { links }
}

// Ensure case-insensitivity as svelte's routing (or the browser?) transforms links like /Characters/UCR001 to /characters/ucr001. 
function writeJson(dir, fileName, data) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(`${dir}/${fileName.toLowerCase()}.json`, JSON.stringify(data))
}