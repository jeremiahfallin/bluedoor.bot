const { QuickYAML } = require("quick-yaml.db");
const config = require("../config");

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
  try {
    const leaderboardChannel = guild.channels.cache.find(
      (channel) => channel.name === "leaderboard"
    );

    if (!leaderboardChannel) return;

    // Get the leaderboard from the database
    const leaderboard = leaderboardDB.get("leaderboard") || {};

    const ratings = await this.calculateBradleyTerryRatings(leaderboard);

    // Sort the leaderboard based on total wins
    const sortedLeaderboard = Object.entries(ratings)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [team, data]) => ({ ...r, [team]: data }), {});

    // Build the leaderboard message with team names, total wins, and specific matchups
    let leaderboardMessage = "**Leaderboard**\n\n";
    for (const [team, data] of Object.entries(sortedLeaderboard)) {
      leaderboardMessage += `<@&${team}>: ${data.toFixed(2)} (${
        leaderboard[team].wins
      } wins)\n`;
    }

    // Fetch the last message in the leaderboard channel to update it
    const messages = await leaderboardChannel.messages.fetch({ limit: 1 });
    const leaderboardMsg = messages.first();
    if (leaderboardMsg) {
      await leaderboardMsg.edit(leaderboardMessage);
    } else {
      await leaderboardChannel.send(leaderboardMessage);
    }
  } catch (error) {
    console.error("Failed to refresh leaderboard message:", error);
  }
};

exports.calculateBradleyTerryRatings = async (gameRecords) => {
  const maxIterations = 1000;
  const tolerance = 0.0001;
  const epsilon = 1e-4;
  const minRating = 1e-6;
  const maxRating = 1e6;
  try {
    const teams = Object.keys(gameRecords);

    let ratings = {
      ...teams.reduce((acc, team) => ({ ...acc, [team]: 1 }), {}),
    };

    for (let i = 0; i < maxIterations; i++) {
      const ratingsCopy = { ...ratings };

      for (let team of teams) {
        let numerator = 0;
        let denominator = 0;

        for (let otherTeam of teams) {
          if (team === otherTeam) continue;

          const teamRating = Math.max(ratings[team], minRating);
          const otherTeamRating = Math.max(ratings[otherTeam], minRating);

          const beatenByTeam = gameRecords[team].beatenTeams[otherTeam] || 0;
          const beatenByOtherTeam =
            gameRecords[otherTeam].beatenTeams[team] || 0;

          numerator +=
            (beatenByTeam * otherTeamRating) /
            (teamRating + otherTeamRating + epsilon);
          denominator +=
            (beatenByOtherTeam * teamRating) /
            (teamRating + otherTeamRating + epsilon);
        }

        ratings[team] = numerator / (denominator + epsilon);
        ratings[team] = Math.min(Math.max(ratings[team], minRating), maxRating);
      }

      const geoMean = Math.pow(
        teams.reduce((acc, team) => acc * ratings[team], 1),
        1 / teams.length
      );

      for (let t in ratings) {
        ratings[t] = ratings[t] / geoMean;
      }

      if (
        Math.abs(
          Object.values(ratingsCopy).reduce((acc, r) => acc + r, 0) -
            Object.values(ratings).reduce((acc, r) => acc + r, 0)
        ) < tolerance
      ) {
        break;
      }
    }

    return ratings;
  } catch (error) {
    console.error("Failed to calculate ratings:", error);
  }
};
