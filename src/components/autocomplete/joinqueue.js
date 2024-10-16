const AutocompleteComponent = require("../../structure/AutocompleteComponent");

module.exports = new AutocompleteComponent({
  commandName: "joinqueue",
  run: async (client, interaction) => {
    const focusedValue = interaction.options.getFocused();
    console.log(focusedValue);
    const choices = interaction.member.roles.cache
      .filter((role) => !role.managed && role.name !== "@everyone")
      .map((role) => role.name);
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
}).toJSON();
