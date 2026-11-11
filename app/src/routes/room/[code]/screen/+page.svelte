<script lang="ts">
  import { onMount } from 'svelte';

  let { data } = $props();

  interface NowPlaying {
    roomId: string;
    spotifyUri: string;
    title: string;
    artists: string;
    albumArt: string | null;
    durationMs: number;
    progressMs: number;
    isPlaying: boolean;
  }

  interface QueueEntry {
    id: string;
    title: string;
    artists: string;
    albumArt: string | null;
    durationMs: number;
    addedByName: string | null;
    voteScore: number;
  }

  interface HistoryEntry {
    id: string;
    title: string;
    artists: string;
    albumArt: string | null;
    addedByName: string | null;
    totalVotes: number;
    playedAt: number | Date;
  }

  const roomCode = data.room.id;
  const appUrl = (data.appUrl as string | undefined) ?? 'wikebox.app';
  const displayUrl = appUrl.replace(/^https?:\/\//, '');

  let roomName = $state(data.room.name);
  let nowPlaying = $state<NowPlaying | null>(null);
  let upNext = $state<QueueEntry[]>([]);
  let history = $state<HistoryEntry[]>(data.initialHistory as HistoryEntry[]);
  let progressMs = $state(0);
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let clockStr = $state('');
  let clockInterval: ReturnType<typeof setInterval> | null = null;

  const progressPct = $derived(
    nowPlaying ? Math.min(100, (progressMs / nowPlaying.durationMs) * 100) : 0
  );

  function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function updateClock() {
    const now = new Date();
    clockStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  async function fetchQueue() {
    try {
      const res = await fetch(`/api/queue?room=${roomCode}`);
      if (res.ok) {
        const queue = await res.json() as QueueEntry[];
        upNext = queue.filter((s: any) => s.status === 'pending').slice(0, 3);
      }
    } catch { /* ignore */ }
  }

  async function fetchHistory() {
    try {
      const res = await fetch(`/api/rooms/${roomCode}/history`);
      if (res.ok) history = await res.json() as HistoryEntry[];
    } catch { /* ignore */ }
  }

  onMount(() => {
    fetchQueue();
    updateClock();

    clockInterval = setInterval(updateClock, 1000);

    progressInterval = setInterval(() => {
      if (nowPlaying?.isPlaying) {
        progressMs = Math.min(progressMs + 1000, nowPlaying.durationMs);
      }
    }, 1000);

    const es = new EventSource(`/api/sse/${roomCode}`);

    es.addEventListener('now-playing', (e) => {
      const np = JSON.parse(e.data) as NowPlaying;
      nowPlaying = np;
      progressMs = np.progressMs;
    });

    es.addEventListener('queue-update', (e) => {
      fetchQueue();
      const d = JSON.parse(e.data) as { type: string };
      if (d.type === 'song-changed') fetchHistory();
    });

    return () => {
      es.close();
      if (progressInterval) clearInterval(progressInterval);
      if (clockInterval) clearInterval(clockInterval);
    };
  });
</script>

<svelte:head>
  <title>{roomName ? `${roomName} · Wikebox` : 'Wikebox'}</title>
</svelte:head>

<div class="min-h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden" style="font-family: 'Inter', system-ui, sans-serif;">

  <!-- Blurred album art backdrop -->
  {#if nowPlaying?.albumArt}
    <div
      class="fixed inset-0 opacity-10 pointer-events-none"
      style="background-image: url({nowPlaying.albumArt}); background-size: cover; background-position: center; filter: blur(60px) saturate(1.5);"
    ></div>
  {/if}

  <!-- Top bar: branding + clock -->
  <div class="flex items-center justify-between px-10 pt-8 pb-0 relative z-10">
    <div class="flex items-center gap-4">
      <span class="text-2xl font-black tracking-tight text-white opacity-60">WIKEBOX</span>
      {#if roomName}
        <span class="text-white/40 text-xl">·</span>
        <span class="text-xl font-semibold text-white opacity-80">{roomName}</span>
      {/if}
    </div>
    <div class="text-right">
      <p class="text-5xl font-bold text-white/70 tabular-nums tracking-tight">{clockStr}</p>
    </div>
  </div>

  <div class="flex flex-1 gap-0 px-10 py-8 overflow-hidden relative z-10">

    <!-- Left column: Now Playing -->
    <div class="flex-1 flex flex-col justify-center pr-10">
      {#if nowPlaying}
        <div class="mb-8">
          {#if nowPlaying.albumArt}
            <img
              src={nowPlaying.albumArt}
              alt={nowPlaying.title}
              class="w-96 h-96 rounded-2xl shadow-2xl object-cover"
              style="box-shadow: 0 0 120px rgba(255,255,255,0.05), 0 30px 80px rgba(0,0,0,0.8);"
            />
          {:else}
            <div class="w-96 h-96 rounded-2xl bg-white/5 flex items-center justify-center">
              <span class="text-6xl opacity-20">♪</span>
            </div>
          {/if}
        </div>

        <div class="space-y-2 mb-8">
          <p class="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">Ahora suena</p>
          <h1
            class="font-black leading-none text-white"
            style="font-size: clamp(2.5rem, 5vw, 5rem); line-height: 1.05;"
          >
            {nowPlaying.title}
          </h1>
          <p class="text-white/60 font-light" style="font-size: clamp(1.25rem, 2.5vw, 2rem);">
            {nowPlaying.artists}
          </p>
        </div>

        <div class="space-y-2">
          <div class="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#1DB954] rounded-full transition-all duration-1000"
              style="width: {progressPct}%"
            ></div>
          </div>
          <div class="flex justify-between text-white/30 text-sm tabular-nums">
            <span>{formatDuration(progressMs)}</span>
            <span>{formatDuration(nowPlaying.durationMs)}</span>
          </div>
        </div>

      {:else}
        <div class="space-y-4">
          <p class="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">Ahora suena</p>
          <div class="w-96 h-96 rounded-2xl bg-white/5 flex items-center justify-center">
            <span class="text-7xl opacity-10">♪</span>
          </div>
          <p class="text-white/30 text-2xl font-light">Nada sonando</p>
        </div>
      {/if}
    </div>

    <!-- Right column: Up next + History -->
    <div class="w-[460px] flex flex-col gap-8 overflow-hidden">

      <!-- Up next -->
      <div class="flex-1 min-h-0">
        <p class="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase mb-5">A continuación</p>
        {#if upNext.length === 0}
          <p class="text-white/20 text-lg font-light">Cola vacía</p>
        {:else}
          <ul class="space-y-4">
            {#each upNext as song, i (song.id)}
              <li class="flex items-center gap-4">
                <span class="text-3xl font-black text-white/10 w-8 text-right flex-shrink-0">{i + 1}</span>
                {#if song.albumArt}
                  <img
                    src={song.albumArt}
                    alt={song.title}
                    class="w-14 h-14 rounded-lg object-cover flex-shrink-0 opacity-90"
                  />
                {:else}
                  <div class="w-14 h-14 rounded-lg bg-white/5 flex-shrink-0"></div>
                {/if}
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-white text-lg leading-tight truncate">{song.title}</p>
                  <p class="text-white/50 text-sm truncate">{song.artists}</p>
                </div>
                <div class="flex-shrink-0 text-right">
                  <span
                    class="text-sm font-bold tabular-nums px-2 py-0.5 rounded-full
                      {song.voteScore > 0 ? 'bg-[#1DB954]/20 text-[#1DB954]' : song.voteScore < 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/30'}"
                  >
                    {song.voteScore > 0 ? '+' : ''}{song.voteScore}
                  </span>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="h-px bg-white/5"></div>

      <!-- History -->
      <div class="flex-shrink-0">
        <p class="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase mb-5">Ya sonaron</p>
        {#if history.length === 0}
          <p class="text-white/20 text-sm font-light">Aún no ha sonado ninguna canción</p>
        {:else}
          <ul class="space-y-3">
            {#each history as entry (entry.id)}
              <li class="flex items-center gap-3">
                {#if entry.albumArt}
                  <img
                    src={entry.albumArt}
                    alt={entry.title}
                    class="w-10 h-10 rounded object-cover flex-shrink-0 opacity-60"
                  />
                {:else}
                  <div class="w-10 h-10 rounded bg-white/5 flex-shrink-0"></div>
                {/if}
                <div class="min-w-0 flex-1">
                  <p class="text-white/60 text-sm font-medium truncate">{entry.title}</p>
                  <p class="text-white/30 text-xs truncate">{entry.artists}</p>
                </div>
                <div class="flex-shrink-0 text-right">
                  {#if entry.totalVotes !== 0}
                    <span class="text-xs tabular-nums {entry.totalVotes > 0 ? 'text-[#1DB954]/60' : 'text-red-400/60'}">
                      {entry.totalVotes > 0 ? '+' : ''}{entry.totalVotes}
                    </span>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

    </div>
  </div>

  <!-- Bottom bar: room code -->
  <div class="px-10 pb-8 flex items-center justify-between relative z-10">
    <div class="flex items-center gap-3">
      <span class="text-white/20 text-sm">Únete en</span>
      <span class="text-white/60 text-sm font-mono font-semibold">{displayUrl}</span>
      <span class="text-white/20 text-sm">·</span>
      <span class="text-white/20 text-sm">Código</span>
      <span class="text-3xl font-black font-mono tracking-[0.25em] text-white/80 bg-white/5 px-4 py-1 rounded-xl">
        {roomCode}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse"></div>
      <span class="text-white/20 text-sm">En directo</span>
    </div>
  </div>

</div>
