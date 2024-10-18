const AutocompleteComponent = require("../../structure/AutocompleteComponent");

module.exports = new AutocompleteComponent({
  commandName: "joinqueue",
  run: async (client, interaction) => {
    const focusedValue = interaction.options.getFocused();
    const choices = interaction.member.roles.cache
      .filter((role) => !role.managed && role.name !== "@everyone")
      .map((role) => ({ name: role.name, value: role.id }));
    const filtered = choices.filter((choice) =>
      choice.name.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice.name, value: choice.value }))
    );
  },
}).toJSON();
