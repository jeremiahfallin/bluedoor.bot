const AutocompleteComponent = require("../../structure/AutocompleteComponent");
const { getQueueChannelGames } = require("../../utils/database");

module.exports = new AutocompleteComponent({
  commandName: "setleaderboard",
  run: async (client, interaction) => {
    const focusedValue = interaction.options.getFocused();
    const choices = getQueueChannelGames().map((game) => ({
      name: game,
      value: game,
    }));
    const filtered = choices.filter((choice) =>
      choice.name.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice.name, value: choice.value }))
    );
  },
}).toJSON();
