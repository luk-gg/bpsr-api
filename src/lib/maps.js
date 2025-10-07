import SceneTable from "$client/Tables/SceneTable.json";
import { completeCommonData, getAllText, getBriefArr } from "./utils/index.js";
import SceneObjectTable from "$client/Tables/SceneObjectTable.json";
import SceneResourceTable from "$client/Tables/SceneResourceTable.json";
import TransferTable from "$client/Tables/TransferTable.json";
import EnvironmentResonanceTable from "$client/Tables/EnvironmentResonanceTable.json";
import DailyWorldEventTable from "$client/Tables/DailyWorldEventTable.json";
import NpcTable from "$client/Tables/NpcTable.json";
import SceneTagTable from "$client/Tables/SceneTagTable.json";
import CollectionTable from "$client/Tables/CollectionTable.json";
import ItemTable from "$client/Tables/ItemTable.json";
import award_packages from "./award_packages.js";

async function mapBySceneId(glob) {
    const entries = await Promise.all(Object.entries(glob).map(async ([path, resolver]) => {
        const match = path.match(/LevelEntities\/(.*?)\/.*\.json/)
        if (!match) throw new Error("Invalid path: " + path)
        const data = await resolver();
        return [match[1], data.default];
    }));
    return Object.fromEntries(entries);
}

const SceneObjectEntityTable = await mapBySceneId(import.meta.glob('$client/Tables/LevelEntities/*/SceneObjectEntityTable.json'));
const CollectionEntityTable = await mapBySceneId(import.meta.glob('$client/Tables/LevelEntities/*/CollectionEntityTable.json'));
const NpcEntityTable = await mapBySceneId(import.meta.glob('$client/Tables/LevelEntities/*/NpcEntityTable.json'));

const SceneObjType = {
    Pivot: 1,
    Resonance: 3,
    Transfer: 4
};

const ItemType = {
    ReadingMaterial: 110
};

function getSceneObjects(sceneId) {
    const sceneObjects = Object.values(SceneObjectEntityTable[sceneId] || {})
        .filter(obj => SceneObjectTable[obj.Id])  // filter invalid references 
        .map(obj => {
            return {
                common: {
                    position: obj.Position,
                },
                instance: obj,
                data: SceneObjectTable[obj.Id]
            };
        });

    const teleportPoints = sceneObjects
        .filter(obj => obj.data.SceneObjType === SceneObjType.Pivot || obj.data.SceneObjType === SceneObjType.Transfer)
        .map(obj => {
            const { Name } = getAllText(TransferTable[obj.data.Id]);
            return {
                ...obj.common,
                name: Name,
                icon: "/ui/atlas/map/map_icon_tp" // TEMP
            };
        });

    const resonancePoints = sceneObjects
        .filter(obj => obj.data.SceneObjType === SceneObjType.Resonance)
        .map(obj => {
            const { Name } = getAllText(EnvironmentResonanceTable[obj.data.Id]);
            return {
                ...obj.common,
                name: Name
            };
        });

    return {
        teleportPoints,
        resonancePoints
    }
}

function getCollectables(sceneId) {
    const collectables = Object.values(CollectionEntityTable[sceneId] || {})
        .filter(obj => CollectionTable[obj.Id])  // filter invalid references 
        .map(obj => {
            return {
                common: {
                    position: obj.Position,
                },
                instance: obj,
                data: CollectionTable[obj.Id]
            };
        });

    const classifyCollectable = (obj) => {
        if (obj.data.Id === 52001)
            return "commonChest";
        if (obj.data.Id === 52002)
            return "exquisiteChest";
        if (obj.data.Id === 52003)
            return "luxuriousChest";
        if (obj.data.AwardId.length === 0)
            return null;
        const awards = award_packages[obj.data.AwardId[0]];
        if (awards.length === 1 && ItemTable[awards[0].itemId]?.ItemType === ItemType.ReadingMaterial) {
            return "readingMaterial";
        }
        return null;
    };

    const classifiedCollectables = collectables
        .filter(obj => obj.instance.RefreshMode === 0 /* EBase */)
        .map(x => ({ ...x, cls: classifyCollectable(x) }));

    function getChests(chestType) {
        return classifiedCollectables
            .filter(obj => obj.cls === chestType)
            .map(obj => {
                const { CollectionName } = getAllText(obj.data);
                return {
                    ...obj.common,
                    name: CollectionName,
                    awardId: obj.data.AwardId,
                    icon: "cook_item_mushroom" // TEMP
                };
            });
    }

    const readingMaterials = classifiedCollectables
        .filter(obj => obj.cls === "readingMaterial")
        .map(obj => {
            const { CollectionName } = getAllText(obj.data);
            return {
                ...obj.common,
                name: CollectionName
            };
        });

    return {
        commonChests: getChests("commonChest"),
        exquisiteChests: getChests("exquisiteChest"),
        luxuriousChests: getChests("luxuriousChest"),
        readingMaterials
    }
}

function getNpcs(sceneId) {
    const npcs = Object.values(NpcEntityTable[sceneId] || {})
        .filter(obj => NpcTable[obj.Id])  // filter invalid references 
        .map(obj => {
            return {
                common: {
                    position: obj.Position,
                },
                instance: obj,
                data: NpcTable[obj.Id],
                tagData: SceneTagTable[NpcTable[obj.Id].SceneTagId]
            };
        });

    const showNpcs = npcs
        .filter(obj => obj.tagData && DailyWorldEventTable[obj.id]?.Scene !== sceneId)
        .map(obj => {
            const { Name } = getAllText(obj.tagData);
            return {
                ...obj.common,
                name: Name,
                icon: obj.tagData.Icon1
            };
        });

    return {
        npcs: showNpcs
    }
}

export const scenes = Object.values(SceneTable).map(scene => {
    const { Name } = completeCommonData(scene);
    const mapId = SceneResourceTable[scene.SceneResourceId].SceneFile.slice(7)

    return {
        id: scene.Id,
        name: Name,
        mapId,
        markerLayers: {
            ...getSceneObjects(scene.Id),
            ...getCollectables(scene.Id),
            ...getNpcs(scene.Id),
        }
    };
})

const entries = scenes.reduce((acc, scene) => {
    const { mapId, name } = scene
    if (!acc[mapId]) {
        acc[mapId] = {
            id: mapId,
            name, // not entirely accurate but it is what it is
            mapImage: `/ui/textures/scenemaps/${mapId}/${mapId}_${mapId}`,
            scenes: []
        }
    }
    acc[mapId].scenes.push(scene)
    return acc
}, {})

export const entries_brief = Object.values(entries).map(map => {
    const sceneNames = map.scenes.map(scene => scene.name)
    const markerNames = map.scenes.flatMap(scene => {
        const markers = Object.values(scene.markerLayers).flat()
        const names = markers.map(marker => marker.name)
        return [...new Set(names)]
    })

    return {
        id: map.id,
        name: map.name,
        sceneNames,
        markerNames
    }
})

export default entries