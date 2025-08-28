// import DT_WeaponData from "../../game/client/Content/Product/Weapon/Common/DT_WeaponData.json" // Contains base weapon string IDs
// import DT_WeaponAttributeEffectTextData from "../../game/client/Content/Product/DataTable/UI/DT_WeaponAttributeEffectTextData.json" // Contains "EX Apply Element" text
import DT_WeaponBaseData from "../../game/client/Content/Product/DataTable/Inventory/DT_WeaponBaseData.json"
import WPS_Melee from "../../game/client/Content/Product/Weapon/Common/Spec/WPS_Melee.json"
import WPS_Range from "../../game/client/Content/Product/Weapon/Common/Spec/WPS_Range.json"
import en from "../../game/client/Content/Localization/Game/en/Game.json";
import { getBriefArr } from "./utils";
import { imgPath } from "/utils";
import WEAPON_ATTACK from "./weapon_attack"
import WEAPON_SPECIAL_EFFECTS from "./weapon_special_effects"
import WEAPON_CRAFTING_RATES from "./weapon_crafting_rates"

const DT_WeaponBaseData_files = import.meta.glob("/game/client/Content/(Product|Season*)/DataTable/Inventory/DT_WeaponBaseData*", { eager: true, import: "default" })
const WeaponBaseData = Object.values(DT_WeaponBaseData_files).reduce((acc, file) => ({ ...acc, ...file[0].Rows }), {})

const WPS_Melee_files = import.meta.glob("/game/client/Content/(Product|Season*)/Weapon/Common/Spec/WPS_Melee*", { eager: true, import: "default" })
const Melee = Object.values(WPS_Melee_files).reduce((acc, file) => ({ ...acc, ...file[0].Rows }), {})

const WPS_Range_files = import.meta.glob("/game/client/Content/(Product|Season*)/Weapon/Common/Spec/WPS_Range*", { eager: true, import: "default" })
const Range = Object.values(WPS_Range_files).reduce((acc, file) => ({ ...acc, ...file[0].Rows }), {})

const entries = Object.entries(WeaponBaseData)
    .map(([id, weapon]) => {
        const name = en.ST_SevenUI[weapon.name]
        const icon = imgPath(weapon.icon.AssetPathName)

        const elements = [weapon.attribute, weapon.attribute_2, weapon.attribute_3, weapon.attribute_4]
            .map(value => value.split("::").pop())
            .filter(element => element !== "None")

        const subtypes = [weapon.division, weapon.division_sub]
            .map(value => value.split("::").pop())
            .filter(type => type !== "None")

        const charId = weapon.character.split("::").pop()
        const dlc = weapon.dlc.split("::").pop()
        const craftingRates = WEAPON_CRAFTING_RATES[id]
        const { weak_attribute_damage_up, all_attribute_damage_resist, named_special_effect } = weapon

        const stats = [...Object.values(Melee), ...Object.values(Range)]
            .filter(wepStats =>
                // LLENN's types are SubMachineGun and HandGun, but she also uses DualHandGun.
                // type.includes(wepStats.division.split("::").pop()) && 
                wepStats.character_unique === `EVGCharaUnique::${charId}`
            )

        const specialEffects = WEAPON_SPECIAL_EFFECTS[id]

        return {
            // ...weapon,
            id,
            name,
            charId,
            type: id.slice(0, 3),
            subtypes,
            elements,
            weak_attribute_damage_up,
            all_attribute_damage_resist,
            named_special_effect,
            dlc,
            icon,
            stats,
            craftingRates,
            specialEffects,
            attack: WEAPON_ATTACK[id],
        }
    })

export const entries_brief = getBriefArr(entries)

export default entries