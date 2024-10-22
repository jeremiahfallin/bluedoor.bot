const { ApplicationCommandOptionType } = require("discord.js");
const { getQueueChannels } = require("../../utils/database");

module.exports = {
  __type__: 1,
  command: {
    name: "listqueues",
    description: "List all queue channels",
  },
  run: async (client, interaction) => {
    const queueChannels = getQueueChannels();
    const queueList = Object.entries(queueChannels)
      .map(([channelId, data]) => `<#${channelId}>: ${data.name}`)
      .join("\n");

    if (queueList) {
      await interaction.reply(`Queue channels:\n${queueList}`);
    } else {
      await interaction.reply("There are no queue channels set up.");
    }
  },
};
