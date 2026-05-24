<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  interface QueueEntry {
    id: string;
    spotifyUri: string;
    title: string;
    artists: string;
    albumArt: string | null;
    durationMs: number;
    addedByName: string | null;
    createdAt: Date | null;
    voteScore: number;
    myVote: number | null;
  }

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

  interface SearchResult {
    uri: string;
    name: string;
    artists: string;
    albumArt: string | null;
    durationMs: number;
  }

  let { data } = $props();

  const lang = getContext<Writable<'es' | 'en'>>('lang');

  let queue = $state<QueueEntry[]>(data.queue as QueueEntry[]);
  let nowPlaying = $state<NowPlaying | null>(data.nowPlaying as NowPlaying | null);
  let searchQuery = $state('');
  let searchResults = $state<SearchResult[]>([]);
  let searching = $state(false);
  let addingUri = $state<string | null>(null);
  let guestName = $state('');
  let showNamePrompt = $state(false);
  let pendingTrack = $state<SearchResult | null>(null);
  let errorMsg = $state('');
  let progressMs = $state(nowPlaying?.progressMs ?? 0);
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let skipCount = $state(0);
  let skipRequired = $state(0);
  let mySkipVote = $state(false);
  let sdkReady = $state(false);
  let sdkPlayer: any = null;

  const queueUris = $derived(new Set(queue.map(s => s.spotifyUri)));

  const t = $derived({
    nowPlaying: $lang === 'es' ? 'Ahora suena' : 'Now playing',
    nothingPlaying: $lang === 'es' ? 'Nada sonando ahora' : 'Nothing playing',
    search: $lang === 'es' ? 'Buscar canción' : 'Search song',
    searchPlaceholder: $lang === 'es' ? 'Buscar en Spotify…' : 'Search Spotify…',
    noResults: $lang === 'es' ? 'Sin resultados' : 'No results',
    inQueue: $lang === 'es' ? 'En cola' : 'In queue',
    queue: $lang === 'es' ? 'Cola' : 'Queue',
    song: $lang === 'es' ? 'canción' : 'song',
    songs: $lang === 'es' ? 'canciones' : 'songs',
    emptyQueue: $lang === 'es' ? 'La cola está vacía' : 'Queue is empty',
    emptyQueueSub: $lang === 'es' ? 'Busca una canción y añádela' : 'Search for a song and add it',
    addedBy: $lang === 'es' ? 'añadida por' : 'added by',
    screen: $lang === 'es' ? 'Pantalla' : 'Screen',
    admin: $lang === 'es' ? 'Admin' : 'Admin',
    namePromptTitle: $lang === 'es' ? '¿Cómo te llamas?' : 'What\'s your name?',
    namePromptSub: $lang === 'es' ? 'Tu nombre aparecerá junto a las canciones que añadas.' : 'Your name will appear next to the songs you add.',
    namePlaceholder: $lang === 'es' ? 'Tu nombre (opcional)' : 'Your name (optional)',
    cancel: $lang === 'es' ? 'Cancelar' : 'Cancel',
    addSong: $lang === 'es' ? 'Añadir canción' : 'Add song',
    code: $lang === 'es' ? 'Código' : 'Code',
    sdkActive: $lang === 'es' ? 'SDK activo' : 'SDK active',
    sdkConnecting: $lang === 'es' ? 'SDK conectando…' : 'SDK connecting…',
  });

  // Format milliseconds as mm:ss
  function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // Progress as percentage
  const progressPct = $derived(
    nowPlaying ? Math.min(100, (progressMs / nowPlaying.durationMs) * 100) : 0
  );

  // Debounce search
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  function onSearchInput() {
    if (searchTimer) clearTimeout(searchTimer);
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }
    searchTimer = setTimeout(() => doSearch(searchQuery), 400);
  }

  async function doSearch(q: string) {
    searching = true;
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}&room=${data.room.id}`);
      if (!res.ok) throw new Error('Search failed');
      searchResults = await res.json() as SearchResult[];
    } catch {
      searchResults = [];
    } finally {
      searching = false;
    }
  }

  async function addSong(track: SearchResult) {
    if (queueUris.has(track.uri)) return;

    // Ask for name if not set yet
    const name = guestName.trim() || localStorage.getItem('wike_guest_name') || '';
    if (!name) {
      pendingTrack = track;
      showNamePrompt = true;
      return;
    }

    await doAddSong(track, name);
  }

  async function confirmNameAndAdd() {
    if (!pendingTrack) return;
    const name = guestName.trim();
    if (name) localStorage.setItem('wike_guest_name', name);
    showNamePrompt = false;
    await doAddSong(pendingTrack, name || 'Guest');
    pendingTrack = null;
  }

  async function doAddSong(track: SearchResult, addedByName: string) {
    addingUri = track.uri;
    errorMsg = '';
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: data.room.id,
          spotifyUri: track.uri,
          title: track.name,
          artists: track.artists,
          albumArt: track.albumArt,
          durationMs: track.durationMs,
          addedByName
        })
      });
      if (res.status === 409) {
        errorMsg = $lang === 'es' ? 'Esta canción ya está en la cola' : 'This song is already in the queue';
        return;
      }
      if (res.status === 403) {
        errorMsg = $lang === 'es' ? 'Esta canción está bloqueada en esta sala' : 'This song is blocked in this room';
        return;
      }
      if (!res.ok) throw new Error('Failed to add song');
      // Queue will update via SSE
      searchQuery = '';
      searchResults = [];
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : ($lang === 'es' ? 'Error añadiendo canción' : 'Error adding song');
    } finally {
      addingUri = null;
    }
  }

  async function vote(songId: string, value: 1 | -1) {
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, value })
      });
      // Queue will update via SSE
    } catch {
      // ignore
    }
  }

  async function voteSkip() {
    try {
      const res = await fetch('/api/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: data.room.id })
      });
      if (res.ok) {
        const d = await res.json() as { action: string; skipCount: number; required: number };
        skipCount = d.skipCount;
        skipRequired = d.required;
        mySkipVote = d.action === 'added';
      }
    } catch { /* ignore */ }
  }

  async function refreshSkipStatus() {
    try {
      const res = await fetch(`/api/skip?room=${data.room.id}`);
      if (res.ok) {
        const d = await res.json() as { skipCount: number; required: number };
        skipCount = d.skipCount;
        skipRequired = d.required;
      }
    } catch { /* ignore */ }
  }

  async function refreshQueue() {
    try {
      const res = await fetch(`/api/queue?room=${data.room.id}`);
      if (res.ok) queue = await res.json() as QueueEntry[];
    } catch {
      // ignore
    }
  }

  async function initSDK() {
    const res = await fetch(`/api/spotify/token?room=${data.room.id}`);
    if (!res.ok) return;
    const { token: initialToken } = await res.json() as { token: string };

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const player = new (window as any).Spotify.Player({
        name: `Wikebox · ${data.room.name}`,
        getOAuthToken: async (cb: (t: string) => void) => {
          const r = await fetch(`/api/spotify/token?room=${data.room.id}`);
          if (r.ok) { const d = await r.json() as { token: string }; cb(d.token); }
          else cb(initialToken);
        },
        volume: 0.8
      });
      player.addListener('ready', async ({ device_id }: { device_id: string }) => {
        sdkReady = true;
        await fetch(`/api/rooms/${data.room.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeDeviceId: device_id })
        });
      });
      player.addListener('not_ready', () => { sdkReady = false; });
      player.connect();
      sdkPlayer = player;
    };
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(script);
  }

  // SSE connection
  onMount(() => {
    // Load saved guest name
    const saved = localStorage.getItem('wike_guest_name');
    if (saved) guestName = saved;

    // Start progress ticker
    progressMs = nowPlaying?.progressMs ?? 0;
    progressInterval = setInterval(() => {
      if (nowPlaying?.isPlaying) {
        progressMs = Math.min(progressMs + 1000, nowPlaying.durationMs);
      }
    }, 1000);

    refreshSkipStatus();
    const es = new EventSource(`/api/sse/${data.room.id}`);

    es.addEventListener('now-playing', (e) => {
      const np = JSON.parse(e.data) as NowPlaying;
      nowPlaying = np;
      progressMs = np.progressMs;
    });

    es.addEventListener('queue-update', (e) => {
      refreshQueue();
      const d = JSON.parse(e.data) as { type: string };
      if (d.type === 'skip' || d.type === 'song-changed') {
        mySkipVote = false;
        skipCount = 0;
      }
      refreshSkipStatus();
    });

    if (data.room.playbackMode === 'sdk' && data.isAdmin) {
      initSDK();
    }

    return () => {
      es.close();
      if (progressInterval) clearInterval(progressInterval);
    };
  });
</script>

<div class="min-h-screen bg-background flex flex-col">
  <!-- Header -->
  <header class="border-b border-border px-4 py-3 flex items-center justify-between">
    <div>
      <h1 class="text-lg font-bold text-foreground">{data.room.name}</h1>
      <p class="text-xs text-muted-foreground">{t.code}: <span class="font-mono font-semibold">{data.room.id}</span></p>
    </div>
    <div class="flex items-center gap-2">
      {#if data.room.playbackMode === 'sdk' && data.isAdmin}
        <div
          class="flex items-center gap-1.5 text-xs text-muted-foreground"
          title={sdkReady ? t.sdkActive : t.sdkConnecting}
        >
          <div class="w-2 h-2 rounded-full {sdkReady ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}"></div>
          <span class="hidden sm:inline">SDK</span>
        </div>
      {/if}
      {#if data.isAdmin}
        <a
          href="/room/{data.room.id}/admin"
          class="text-xs px-2.5 py-1.5 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.admin}
        </a>
      {/if}
      <a
        href="/room/{data.room.id}/screen"
        class="text-xs text-muted-foreground hover:text-foreground underline"
        target="_blank"
      >
        {t.screen}
      </a>
    </div>
  </header>

  <!-- Welcome message banner -->
  {#if data.room.welcomeMessage}
    <div class="px-4 py-2.5 bg-primary/10 border-b border-primary/20 text-sm text-foreground">
      {data.room.welcomeMessage}
    </div>
  {/if}

  <div class="flex flex-col lg:flex-row flex-1 overflow-hidden">
    <!-- Left: Now playing + Search -->
    <div class="lg:w-96 flex flex-col border-r border-border">
      <!-- Now Playing -->
      {#if nowPlaying}
        <div class="p-4 bg-card border-b border-border">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t.nowPlaying}</p>
          <div class="flex gap-3 items-center">
            {#if nowPlaying.albumArt}
              <img src={nowPlaying.albumArt} alt={nowPlaying.title} class="w-16 h-16 rounded-md object-cover flex-shrink-0" />
            {:else}
              <div class="w-16 h-16 rounded-md bg-muted flex-shrink-0"></div>
            {/if}
            <div class="min-w-0">
              <p class="font-semibold text-sm truncate text-foreground">{nowPlaying.title}</p>
              <p class="text-xs text-muted-foreground truncate">{nowPlaying.artists}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {formatDuration(progressMs)} / {formatDuration(nowPlaying.durationMs)}
              </p>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-1000"
              style="width: {progressPct}%"
            ></div>
          </div>
          <!-- Skip vote -->
          <div class="mt-3 flex items-center gap-2">
            <button
              onclick={voteSkip}
              class="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all
                {mySkipVote
                  ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'}"
              title={mySkipVote ? ($lang === 'es' ? 'Retirar voto' : 'Remove vote') : ($lang === 'es' ? 'Votar para saltar' : 'Vote to skip')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18L14.5 12 6 6v12zM16 6v12h2V6h-2z"/></svg>
              {#if skipRequired > 0}
                <span class="tabular-nums">{skipCount}/{skipRequired}</span>
              {:else}
                <span>{mySkipVote ? ($lang === 'es' ? 'Retirar' : 'Remove') : 'Skip'}</span>
              {/if}
            </button>
          </div>
        </div>
      {:else}
        <div class="p-4 bg-card border-b border-border">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t.nowPlaying}</p>
          <p class="text-sm text-muted-foreground">{t.nothingPlaying}</p>
        </div>
      {/if}

      <!-- Search -->
      <div class="p-4 flex-1 overflow-y-auto">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t.search}</p>
        <div class="relative">
          <input
            bind:value={searchQuery}
            oninput={onSearchInput}
            placeholder={t.searchPlaceholder}
            class="w-full rounded-md border border-border bg-card px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {#if searching}
            <div class="absolute right-2 top-2.5 h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          {/if}
        </div>

        {#if errorMsg}
          <p class="mt-2 text-xs text-red-500">{errorMsg}</p>
        {/if}

        <!-- Search results -->
        {#if searchResults.length > 0}
          <ul class="mt-3 space-y-1">
            {#each searchResults as track (track.uri)}
              <li class="flex items-center gap-2 p-2 rounded-md hover:bg-muted group">
                {#if track.albumArt}
                  <img src={track.albumArt} alt={track.name} class="w-10 h-10 rounded object-cover flex-shrink-0" />
                {:else}
                  <div class="w-10 h-10 rounded bg-muted flex-shrink-0"></div>
                {/if}
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate text-foreground">{track.name}</p>
                  <p class="text-xs text-muted-foreground truncate">{track.artists}</p>
                </div>
                <button
                  onclick={() => addSong(track)}
                  disabled={queueUris.has(track.uri) || addingUri === track.uri}
                  class="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium
                    {queueUris.has(track.uri)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:opacity-90'}"
                >
                  {queueUris.has(track.uri) ? t.inQueue : addingUri === track.uri ? '…' : '+'}
                </button>
              </li>
            {/each}
          </ul>
        {:else if searchQuery.trim() && !searching}
          <p class="mt-3 text-sm text-muted-foreground">{t.noResults}</p>
        {/if}
      </div>
    </div>

    <!-- Right: Queue -->
    <div class="flex-1 overflow-y-auto p-4">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        {t.queue} · {queue.length} {queue.length === 1 ? t.song : t.songs}
      </p>

      {#if queue.length === 0}
        <div class="text-center py-12 text-muted-foreground">
          <p class="text-lg">{t.emptyQueue}</p>
          <p class="text-sm mt-1">{t.emptyQueueSub}</p>
        </div>
      {:else}
        <ul class="space-y-2">
          {#each queue as song, i (song.id)}
            <li class="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <!-- Position -->
              <span class="text-xs text-muted-foreground w-5 text-center flex-shrink-0">{i + 1}</span>

              <!-- Album art -->
              {#if song.albumArt}
                <img src={song.albumArt} alt={song.title} class="w-12 h-12 rounded object-cover flex-shrink-0" />
              {:else}
                <div class="w-12 h-12 rounded bg-muted flex-shrink-0"></div>
              {/if}

              <!-- Song info -->
              <div class="min-w-0 flex-1">
                <p class="font-medium text-sm truncate text-foreground">{song.title}</p>
                <p class="text-xs text-muted-foreground truncate">{song.artists}</p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {formatDuration(song.durationMs)} · {t.addedBy} {song.addedByName ?? 'Guest'}
                </p>
              </div>

              <!-- Vote controls -->
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  onclick={() => vote(song.id, 1)}
                  class="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors
                    {song.myVote === 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'}"
                  title="Voto positivo"
                >
                  ▲
                </button>
                <span class="text-sm font-semibold w-6 text-center text-foreground">
                  {song.voteScore > 0 ? '+' : ''}{song.voteScore}
                </span>
                <button
                  onclick={() => vote(song.id, -1)}
                  class="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors
                    {song.myVote === -1
                      ? 'bg-red-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-red-500/20 hover:text-red-500'}"
                  title="Voto negativo"
                >
                  ▼
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>

<!-- Guest name prompt modal -->
{#if showNamePrompt}
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onclick={(e) => { if (e.target === e.currentTarget) showNamePrompt = false; }}
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4">
      <h2 class="text-lg font-semibold text-foreground">{t.namePromptTitle}</h2>
      <p class="text-sm text-muted-foreground">{t.namePromptSub}</p>
      <input
        bind:value={guestName}
        placeholder={t.namePlaceholder}
        class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        onkeydown={(e) => e.key === 'Enter' && confirmNameAndAdd()}
        autofocus
      />
      <div class="flex gap-2 justify-end">
        <button
          onclick={() => { guestName = ''; showNamePrompt = false; pendingTrack = null; }}
          class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted"
        >
          {t.cancel}
        </button>
        <button
          onclick={confirmNameAndAdd}
          class="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium"
        >
          {t.addSong}
        </button>
      </div>
    </div>
  </div>
{/if}
