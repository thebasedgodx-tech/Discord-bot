const { SlashCommandBuilder } = require('discord.js');
const { getQueue, resolveTrack, ensureConnection, playNext } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Speel een nummer of zoekterm af')
    .addStringOption((o) =>
      o.setName('query').setDescription('YouTube-URL of zoekterm').setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('query', true);
    const q = await ensureConnection(interaction);
    const track = await resolveTrack(query);
    if (!track) return interaction.editReply('❌ Niets gevonden voor die zoekterm.');
    track.requestedBy = interaction.user.username;
    q.tracks.push(track);
    if (!q.playing) {
      await playNext(interaction.guildId);
      return interaction.editReply(`▶️ Start met **${track.title}**`);
    }
    return interaction.editReply(`➕ Toegevoegd aan queue: **${track.title}** (${track.duration})`);
  },
};
