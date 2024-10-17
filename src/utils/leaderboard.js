const { QuickYAML } = require("quick-yaml.db");
const config = require("../config");
import { calculateBradleyTerryRatings } from "../utils/bradleyTerry";

let leaderboardDB;
try {
  leaderboardDB = new QuickYAML(config.database.path);
} catch (error) {
  console.error("Failed to initialize leaderboard database:", error);
}

exports.updateLeaderboard = async (guild, winner, loser) => {
  // Get existing leaderboard or initialize a new structure
  let leaderboard = leaderboardDB.get("leaderboard") || {};

  // Ensure both teams have an entry in the leaderboard
  if (!leaderboard[winner]) {
    leaderboard[winner] = { wins: 0, beatenTeams: {} };
  }
  if (!leaderboard[loser]) {
    leaderboard[loser] = { wins: 0, beatenTeams: {} };
  }

  // Update the winner's total wins
  leaderboard[winner].wins += 1;

  // Track how many times the winner has beaten the loser
  leaderboard[winner].beatenTeams[loser] =
    (leaderboard[winner].beatenTeams[loser] || 0) + 1;

  // Ensure the loser has an entry but does not gain a win
  leaderboard[loser].wins = leaderboard[loser].wins || 0;

  // Save the updated leaderboard back to the database
  leaderboardDB.set("leaderboard", leaderboard);

  // Refresh the leaderboard message
  await this.refreshLeaderboardMessage(guild);
};

exports.refreshLeaderboardMessage = async (guild) => {
  const leaderboardChannel = guild.channels.cache.find(
    (channel) => channel.name === "leaderboard"
  );

  if (!leaderboardChannel) return;

  // Get the leaderboard from the database
  const leaderboard = leaderboardDB.get("leaderboard") || {};

  calculateBradleyTerryRatings(leaderboard);

  // Sort the leaderboard based on total wins
  const sortedLeaderboard = Object.entries(leaderboard)
    .sort(([, a], [, b]) => b.wins - a.wins)
    .reduce((r, [team, data]) => ({ ...r, [team]: data }), {});

  // Build the leaderboard message with team names, total wins, and specific matchups
  let leaderboardMessage = "**Leaderboard**\n\n";
  for (const [team, data] of Object.entries(sortedLeaderboard)) {
    leaderboardMessage += `${team}: ${data.wins} wins\n`;
  }

  // Fetch the last message in the leaderboard channel to update it
  const messages = await leaderboardChannel.messages.fetch({ limit: 1 });
  const leaderboardMsg = messages.first();
  if (leaderboardMsg) {
    await leaderboardMsg.edit(leaderboardMessage);
  } else {
    await leaderboardChannel.send(leaderboardMessage);
  }
};
