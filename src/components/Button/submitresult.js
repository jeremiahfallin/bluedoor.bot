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
      const winningTeam = interaction.customId.split("_")[1];
      const losingTeam = interaction.message.components[0].components
        .find((button) => button.customId !== interaction.customId)
        .label.replace(" Won", "");

      // Update leaderboard
      await updateLeaderboard(interaction.guild, winningTeam, losingTeam);

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
        content: `Match result: **${winningTeam}** won against **${losingTeam}**!\nThe leaderboard has been updated.`,
        components: updatedComponents,
      });

      // Close the thread after a delay
      setTimeout(() => {
        interaction.channel.setArchived(true, "Match concluded");
      }, 60000); // 1 minute delay
    } catch (err) {
      console.log(err);
    }
  },
}).toJSON();
