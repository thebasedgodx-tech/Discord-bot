const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('leave').setDescription('Verlaat het voice channel'),
  async execute(interaction) {
    const q = queues.get(interaction.guildId);
    if (!q || !q.connection) return interaction.reply({ content: 'Ik zit niet in een voice channel.', ephemeral: true });
    q.tracks = [];
    if (q.player) q.player.stop();
    q.connection.destroy();
    queues.delete(interaction.guildId);
    await interaction.reply('👋 Voice channel verlaten.');
  },
};
