const { ApplicationCommandOptionType } = require("discord.js");
const { addLeaderboardChannel } = require("../../utils/database");

module.exports = {
  __type__: 1,
  command: {
    name: "setleaderboard",
    description: "Set the channel where the leaderboard will be displayed",
    options: [
      {
        name: "game",
        description: "The game the leaderboard is for",
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
      },
    ],
  },
  options: {
    botDevelopers: true, // Or any other permission restriction you prefer
  },
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      return interaction.reply({
        content: "You don't have permission to manage queues.",
        ephemeral: true,
      });
    }

    const gameName = interaction.options.getString("game");

    if (!gameName) {
      return interaction.reply({
        content: "Invalid game selected. Please try again.",
        ephemeral: true,
      });
    }

    addLeaderboardChannel(interaction.channelId, gameName);

    await interaction.reply({
      content: `Leaderboard channel has been set to ${interaction.channel}`,
      ephemeral: true,
    });

    // Initialize the leaderboard message in the new channel
    try {
      const messages = await interaction.channel.messages.fetch({ limit: 1 });
      if (messages.size === 0) {
        await interaction.channel.send(
          "**Leaderboard**\n\nNo matches played yet."
        );
      }
    } catch (error) {
      console.error("Error initializing leaderboard:", error);
    }
  },
};
