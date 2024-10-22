const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const {
  getQueue,
  addToQueue,
  removeFromQueue,
  getQueueChannels,
} = require("../../utils/database");

module.exports = {
  __type__: 1,
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
    const queueChannels = getQueueChannels();
    if (!queueChannels || !queueChannels[interaction.channelId]) {
      return interaction.reply({
        content: "This command can only be used in designated queue channels.",
        ephemeral: true,
      });
    }
    const selectedTeamId = interaction.options.getString("team");
    const selectedTeamRole = interaction.guild.roles.cache.get(selectedTeamId);

    if (!selectedTeamRole) {
      return interaction.reply({
        content: "Invalid team selected. Please try again.",
        ephemeral: true,
      });
    }

    // Check if the user has the role for the selected team
    if (!interaction.member.roles.cache.has(selectedTeamId)) {
      return interaction.reply({
        content: "You are not a member of this team!",
        ephemeral: true,
      });
    }

    const added = addToQueue(interaction.channelId, {
      roleId: selectedTeamId,
      userId: interaction.user.id,
    });
    if (!added) {
      return interaction.reply({
        content: "There was an error joining the queue. Please try again.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `You have joined the queue!`,
        ephemeral: true,
      });
    }

    const queue = getQueue(interaction.channelId);
    if (queue.length >= 2) {
      const [team1, team2] = removeFromQueue(interaction.channelId, 2);
      await createMatch(interaction, team1.roleId, team2.roleId);
    }
  },
};

async function createMatch(interaction, team1RoleId, team2RoleId) {
  const team1Role = await interaction.guild.roles.fetch(team1RoleId);
  const team2Role = await interaction.guild.roles.fetch(team2RoleId);

  const team1Name = team1Role ? team1Role.name : "Unknown Team";
  const team2Name = team2Role ? team2Role.name : "Unknown Team";

  const thread = await interaction.channel.threads.create({
    name: `Match: ${team1Name} vs ${team2Name}`,
    autoArchiveDuration: 60,
    reason: "New match created",
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`result_${team1RoleId}`)
      .setLabel(`${team1Name} Won`)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`result_${team2RoleId}`)
      .setLabel(`${team2Name} Won`)
      .setStyle(ButtonStyle.Primary)
  );

  await thread.send({
    content: `<@&${team1RoleId}> vs <@&${team2RoleId}>\nYour match has been created! Good luck and have fun!\n\nWhen the match is over, click the button for the winning team:`,
    components: [row],
  });
}
