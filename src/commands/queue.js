const { SlashCommandBuilder } = require('discord.js');
const { getQueue } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Toon de wachtrij'),
  async execute(interaction) {
    const q = getQueue(interaction.guildId);
    if (!q.tracks.length) return interaction.reply({ content: 'De queue is leeg.', ephemeral: true });
    const list = q.tracks
      .slice(0, 15)
      .map((t, i) => `${i + 1}. **${t.title}** (${t.duration}) — ${t.requestedBy || '?'}`)
      .join('\n');
    const extra = q.tracks.length > 15 ? `\n…en ${q.tracks.length - 15} meer` : '';
    await interaction.reply(`🎶 **Queue** (${q.tracks.length})\n${list}${extra}`);
  },
};
