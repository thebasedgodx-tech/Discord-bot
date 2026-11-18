const { SlashCommandBuilder } = require('discord.js');
const { getQueue } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop en leeg de queue'),
  async execute(interaction) {
    const q = getQueue(interaction.guildId);
    q.tracks = [];
    if (q.player) q.player.stop();
    q.playing = false;
    await interaction.reply('⏹️ Gestopt en queue geleegd.');
  },
};
