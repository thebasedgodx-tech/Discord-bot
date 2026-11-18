const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require('@discordjs/voice');
const playdl = require('play-dl');

const queues = new Map();

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, { tracks: [], player: null, connection: null, textChannel: null, playing: false });
  }
  return queues.get(guildId);
}

async function resolveTrack(query) {
  if (playdl.yt_validate(query) === 'video') {
    const info = await playdl.video_info(query);
    const d = info.video_details;
    return { title: d.title, url: d.url, duration: d.durationRaw, requestedBy: null };
  }
  const results = await playdl.search(query, { limit: 1, source: { youtube: 'video' } });
  if (!results.length) return null;
  const v = results[0];
  return { title: v.title, url: v.url, duration: v.durationRaw, requestedBy: null };
}

async function ensureConnection(interaction) {
  const channel = interaction.member?.voice?.channel;
  if (!channel) throw new Error('Je moet eerst in een voice channel zitten.');
  const q = getQueue(interaction.guildId);
  if (q.connection && q.connection.joinConfig.channelId === channel.id) return q;
  q.connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
    selfDeaf: true,
  });
  q.connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(q.connection, VoiceConnectionStatus.Signalling, 5000),
        entersState(q.connection, VoiceConnectionStatus.Connecting, 5000),
      ]);
    } catch {
      q.connection.destroy();
      queues.delete(interaction.guildId);
    }
  });
  if (!q.player) {
    q.player = createAudioPlayer();
    q.player.on(AudioPlayerStatus.Idle, () => playNext(interaction.guildId));
    q.player.on('error', (e) => {
      console.error('Player error:', e.message);
      playNext(interaction.guildId);
    });
  }
  q.connection.subscribe(q.player);
  q.textChannel = interaction.channel;
  return q;
}

async function playNext(guildId) {
  const q = queues.get(guildId);
  if (!q) return;
  const track = q.tracks.shift();
  if (!track) {
    q.playing = false;
    return;
  }
  try {
    const stream = await playdl.stream(track.url, { quality: 2 });
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type === 'opus' ? StreamType.Opus : StreamType.Arbitrary,
      inlineVolume: true,
    });
    q.playing = true;
    q.player.play(resource);
    if (q.textChannel) q.textChannel.send(`▶️ Nu aan het spelen: **${track.title}**`).catch(() => {});
  } catch (err) {
    console.error('Stream error:', err.message);
    if (q.textChannel) q.textChannel.send(`⚠️ Kon **${track.title}** niet streamen, overslaan.`).catch(() => {});
    playNext(guildId);
  }
}

module.exports = { queues, getQueue, resolveTrack, ensureConnection, playNext };
