const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
  command: {
    name: "createteam",
    description: "Used to create a new team role and assign it to the user",
    type: 1,
    options: [
      {
        name: "team name",
        description: "The name of the team",
        type: 3, // STRING type
        required: true,
      },
    ],
  },
  options: {
    cooldown: 10000,
  },
  /**
   *
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const teamName = interaction.options.getString("teamname", true); // The 'true' here ensures it's required

    // Check if the role already exists
    let role = interaction.guild.roles.cache.find(
      (role) => role.name === teamName
    );

    if (role) {
      return interaction.reply({
        content: "A team with this name already exists!",
        ephemeral: true,
      });
    }

    try {
      // Create the role
      role = await interaction.guild.roles.create({
        name: teamName,
        color: "Random",
        reason: "New team created",
      });

      // Assign the role to the user
      await interaction.member.roles.add(role);

      await interaction.reply(
        `Team "${teamName}" has been created and assigned to you!`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "There was an error creating the team. Please try again later.",
        ephemeral: true,
      });
    }
  },
}).toJSON();
