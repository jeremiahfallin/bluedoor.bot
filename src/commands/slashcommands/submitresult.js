const { SlashCommandBuilder } = require("@discordjs/builders");
const { updateLeaderboard } = require("../../utils/leaderboard");

module.exports = {
  __type__: 1, // This indicates it's an application (slash) command
  command: {
    name: "submitresult",
    description: "Submit the result of a match",
    options: [
      {
        name: "winner",
        description: "The name of the winning team",
        type: 3, // STRING type
        required: true,
        autocomplete: true,
      },
      {
        name: "loser",
        description: "The name of the losing team",
        type: 3, // STRING type
        required: true,
        autocomplete: true,
      },
    ],
  },
  run: async (client, interaction) => {
    const winner = interaction.options.getString("winner");
    const loser = interaction.options.getString("loser");

    await updateLeaderboard(interaction.guild, winner, loser);

    await interaction.reply(
      `Result submitted! ${winner} wins against ${loser}`
    );
  },
};
