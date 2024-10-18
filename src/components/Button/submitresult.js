const {
  ButtonInteraction,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const { updateLeaderboard } = require("../../utils/leaderboard");

module.exports = new Component({
  customId: "result",
  type: "button",
  /**
   *
   * @param {DiscordBot} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    try {
      const winningRoleId = interaction.customId.split("_")[1];
      const losingRoleId = interaction.message.components[0].components
        .find((button) => button.customId !== interaction.customId)
        .customId.split("_")[1];

      const winningRole = await interaction.guild.roles.fetch(winningRoleId);
      const losingRole = await interaction.guild.roles.fetch(losingRoleId);

      const winningTeamName = winningRole ? winningRole.name : "Unknown Team";
      const losingTeamName = losingRole ? losingRole.name : "Unknown Team";

      // Update leaderboard
      await updateLeaderboard(interaction.guild, winningRoleId, losingRoleId);

      // Rebuild the buttons with 'setDisabled(true)' since original components are raw objects
      const updatedComponents = interaction.message.components.map((row) => {
        const actionRow = ActionRowBuilder.from(row); // Convert to ActionRowBuilder
        actionRow.components = row.components.map(
          (button) => ButtonBuilder.from(button).setDisabled(true) // Convert to ButtonBuilder and disable
        );
        return actionRow;
      });

      // Update the message with the match result and disable the buttons
      await interaction.update({
        content: `Match result: **${winningTeamName}** won against **${losingTeamName}**!\nThe leaderboard has been updated.`,
        components: updatedComponents,
      });

      // Close the thread after a delay
      setTimeout(() => {
        interaction.channel.setArchived(true, "Match concluded");
      }, 60000); // 1 minute delay
    } catch (err) {
      console.error(err);
    }
  },
}).toJSON();
