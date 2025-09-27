import AchievementDataTable from '$client/Tables/AchievementDateTable.json'
import AchievementSeasonTable from '$client/Tables/AchievementSeasonClassTable.json'
import awards from './awards'
import { getAllText } from './utils'

function getAchievementAward(rewardId) {
  return awards[rewardId]
}

function getAchievementSeason(achievementId) {
  const data = Object.values(AchievementSeasonTable).find((season) => {
    return season.EntryList.includes(achievementId)
  })

  if (!data) {
    return null
  }

  const { Id, Type, ClassIcon, ...remain } = data
  return { Id, Type, ClassIcon, ...getAllText(remain) }
}

export default Object.entries(AchievementDataTable).reduce(
  (acc, [achId, ach]) => {
    const Achievement = {
      ...getAllText(ach),
      Reward: getAchievementAward(ach.RewardID),
      Season: getAchievementSeason(ach.AchievementId)
    }
    acc[achId] = Achievement
    return acc
  },
  {}
)
