const { ApplicationCommandOptionType } = require("discord.js");
const { addQueueChannel } = require("../../utils/database");

module.exports = {
  __type__: 1,
  command: {
    name: "createqueue",
    description: "Create a new queue channel",
    options: [
      {
        name: "name",
        description: "The name for this queue",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      return interaction.reply({
        content: "You don't have permission to manage queues.",
        ephemeral: true,
      });
    }

    const queueName = interaction.options.getString("name");
    addQueueChannel(interaction.channelId, queueName);

    await interaction.reply(
      `Queue "${queueName}" has been created in this channel.`
    );
  },
};
