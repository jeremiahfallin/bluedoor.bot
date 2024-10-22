const { ApplicationCommandOptionType } = require("discord.js");
const { removeQueueChannel } = require("../../utils/database");

module.exports = {
  __type__: 1,
  command: {
    name: "removequeue",
    description: "Remove the queue from this channel",
  },
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      return interaction.reply({
        content: "You don't have permission to manage queues.",
        ephemeral: true,
      });
    }

    const removed = removeQueueChannel(interaction.channelId);
    if (removed) {
      await interaction.reply("The queue has been removed from this channel.");
    } else {
      await interaction.reply({
        content: "There was no queue in this channel.",
        ephemeral: true,
      });
    }
  },
};
