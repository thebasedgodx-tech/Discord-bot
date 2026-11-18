const { SlashCommandBuilder } = require('discord.js');
const { getQueue, playNext } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Sla het huidige nummer over'),
  async execute(interaction) {
    const q = getQueue(interaction.guildId);
    if (!q.playing) return interaction.reply({ content: 'Er speelt nu niets.', ephemeral: true });
    q.player.stop();
    await interaction.reply('⏭️ Overgeslagen.');
  },
};
