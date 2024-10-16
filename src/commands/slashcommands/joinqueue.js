const { SlashCommandBuilder } = require("@discordjs/builders");

// This would be better stored in a database
let queue = [];

module.exports = {
  __type__: 1, // This indicates it's an application (slash) command
  command: {
    name: "joinqueue",
    description: "Join the queue with one of your teams",
    options: [
      {
        name: "team",
        description: "The team you want to queue with",
        type: 3, // STRING type
        required: true,
        autocomplete: true,
      },
    ],
  },
  run: async (client, interaction) => {
    const selectedTeam = interaction.options.getString("team");

    // Check if the user has the role for the selected team
    if (
      !interaction.member.roles.cache.some((role) => role.name === selectedTeam)
    ) {
      return interaction.reply({
        content: "You are not a member of this team!",
        ephemeral: true,
      });
    }

    // Add the team to the queue
    queue.push({ team: selectedTeam, user: interaction.user.id });

    await interaction.reply(
      `Your team "${selectedTeam}" has joined the queue!`
    );

    // Check if we can create a match
    if (queue.length >= 2) {
      const team1 = queue.shift();
      const team2 = queue.shift();
      await createMatch(interaction, team1, team2);
    }
  },
};

async function createMatch(interaction, team1, team2) {
  const thread = await interaction.channel.threads.create({
    name: `Match: ${team1.team} vs ${team2.team}`,
    autoArchiveDuration: 60,
    reason: "New match created",
  });

  await thread.send(
    `<@${team1.user}> (Team ${team1.team}) vs <@${team2.user}> (Team ${team2.team})\nYour match has been created! Good luck and have fun!`
  );
}
