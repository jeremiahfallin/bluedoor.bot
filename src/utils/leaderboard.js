const { QuickYAML } = require("quick-yaml.db");
const config = require("../config");

const leaderboardDB = new QuickYAML(config.database.path + "/leaderboard.yml");

exports.updateLeaderboard = async (guild, winner, loser) => {
  let leaderboard = leaderboardDB.get("leaderboard") || {};

  leaderboard[winner] = (leaderboard[winner] || 0) + 1;
  leaderboard[loser] = leaderboard[loser] || 0;

  leaderboardDB.set("leaderboard", leaderboard);

  await this.refreshLeaderboardMessage(guild);
};

exports.refreshLeaderboardMessage = async (guild) => {
  const leaderboardChannel = guild.channels.cache.find(
    (channel) => channel.name === "leaderboard"
  );

  if (!leaderboardChannel) return;

  const leaderboard = leaderboardDB.get("leaderboard") || {};
  const sortedLeaderboard = Object.entries(leaderboard)
    .sort(([, a], [, b]) => b - a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

  let leaderboardMessage = "**Leaderboard**\n\n";
  for (const [team, wins] of Object.entries(sortedLeaderboard)) {
    leaderboardMessage += `${team}: ${wins} wins\n`;
  }

  const messages = await leaderboardChannel.messages.fetch({ limit: 1 });
  const leaderboardMsg = messages.first();
  if (leaderboardMsg) {
    await leaderboardMsg.edit(leaderboardMessage);
  } else {
    await leaderboardChannel.send(leaderboardMessage);
  }
};
