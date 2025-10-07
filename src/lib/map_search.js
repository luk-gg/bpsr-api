import { scenes } from "./maps";
// query: [results]
export default scenes.reduce((acc, scene) => {
    if (scene.name) {
        acc[scene.name] = [{
            type: "Instance",
            mapId: scene.mapId,
            sceneId: scene.id,
        }]

        const allMarkers = Object.entries(scene.markerLayers)

        allMarkers.forEach(([markerType, markers]) => {
            markers.forEach(marker => {
                if (!acc[marker.name]) acc[marker.name] = []

                // Group duplicates while keeping track of how many times a marker appears in a map across ALL scenes
                const existingMarkerIndex = acc[marker.name].indexOf(acc[marker.name].find(marker => marker.mapId === scene.mapId))

                if (existingMarkerIndex > -1) {
                    acc[marker.name][existingMarkerIndex].count++
                }
                else {
                    acc[marker.name].push({
                        type: markerType,
                        mapId: scene.mapId,
                        sceneId: scene.id,
                        count: 1,
                        icon: marker.icon
                    })
                }
            })
        })
    }

    return acc
}, {})