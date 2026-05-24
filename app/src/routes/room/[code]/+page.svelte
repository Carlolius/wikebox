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
    status: 'pending' | 'queued';
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

  const lang = getContext<Writable<'es' | 'gl' | 'en'>>('lang');

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

  const pendingQueue = $derived(queue.filter(s => s.status === 'pending'));
  const queuedSong = $derived(queue.find(s => s.status === 'queued') ?? null);
  const allUris = $derived(new Set(queue.map(s => s.spotifyUri)));

  const t = $derived({
    nowPlaying: $lang === 'en' ? 'Now playing' : $lang === 'gl' ? 'Agora soa' : 'Ahora suena',
    nothingPlaying: $lang === 'en' ? 'Nothing playing' : $lang === 'gl' ? 'Nada soando' : 'Nada sonando ahora',
    search: $lang === 'en' ? 'Search song' : $lang === 'gl' ? 'Buscar canción' : 'Buscar canción',
    searchPlaceholder: $lang === 'en' ? 'Search Spotify…' : 'Buscar en Spotify…',
    noResults: $lang === 'en' ? 'No results' : 'Sin resultados',
    inQueue: $lang === 'en' ? 'In queue' : 'En cola',
    queue: $lang === 'en' ? 'Queue' : 'Cola',
    nextUp: $lang === 'en' ? 'Next · Queued to Spotify' : $lang === 'gl' ? 'Seguinte · En cola de Spotify' : 'Siguiente · En cola de Spotify',
    locked: $lang === 'en' ? 'Queued' : 'Encolada',
    song: $lang === 'en' ? 'song' : 'canción',
    songs: $lang === 'en' ? 'songs' : 'canciones',
    emptyQueue: $lang === 'en' ? 'Queue is empty' : $lang === 'gl' ? 'A cola está baleira' : 'La cola está vacía',
    emptyQueueSub: $lang === 'en' ? 'Search for a song and add it' : 'Busca una canción y añádela',
    addedBy: $lang === 'en' ? 'added by' : 'añadida por',
    screen: $lang === 'en' ? 'Screen' : 'Pantalla',
    admin: 'Admin',
    namePromptTitle: $lang === 'en' ? "What's your name?" : $lang === 'gl' ? 'Como te chamas?' : '¿Cómo te llamas?',
    namePromptSub: $lang === 'en' ? 'Your name will appear next to the songs you add.' : 'Tu nombre aparecerá junto a las canciones que añadas.',
    namePlaceholder: $lang === 'en' ? 'Your name (optional)' : 'Tu nombre (opcional)',
    cancel: $lang === 'en' ? 'Cancel' : 'Cancelar',
    addSong: $lang === 'en' ? 'Add song' : 'Añadir canción',
    code: $lang === 'en' ? 'Code' : 'Código',
  });

  function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  const progressPct = $derived(
    nowPlaying ? Math.min(100, (progressMs / nowPlaying.durationMs) * 100) : 0
  );

  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  function onSearchInput() {
    if (searchTimer) clearTimeout(searchTimer);
    if (!searchQuery.trim()) { searchResults = []; return; }
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
    if (allUris.has(track.uri)) return;
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
        errorMsg = $lang === 'en' ? 'This song is already in the queue' : 'Esta canción ya está en la cola';
        return;
      }
      if (res.status === 403) {
        errorMsg = $lang === 'en' ? 'This song is blocked in this room' : 'Esta canción está bloqueada en esta sala';
        return;
      }
      if (!res.ok) throw new Error('Failed to add song');
      searchQuery = '';
      searchResults = [];
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : ($lang === 'en' ? 'Error adding song' : 'Error añadiendo canción');
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
    } catch { /* ignore */ }
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
    } catch { /* ignore */ }
  }

  onMount(() => {
    const saved = localStorage.getItem('wike_guest_name');
    if (saved) guestName = saved;

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
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18L14.5 12 6 6v12zM16 6v12h2V6h-2z"/></svg>
              {#if skipRequired > 0}
                <span class="tabular-nums">{skipCount}/{skipRequired}</span>
              {:else}
                <span>{mySkipVote ? ($lang === 'en' ? 'Remove' : 'Retirar') : 'Skip'}</span>
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
                  disabled={allUris.has(track.uri) || addingUri === track.uri}
                  class="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium
                    {allUris.has(track.uri)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:opacity-90'}"
                >
                  {allUris.has(track.uri) ? t.inQueue : addingUri === track.uri ? '…' : '+'}
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

      <!-- Queued to Spotify (locked) -->
      {#if queuedSong}
        <div class="mb-4">
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t.nextUp}</p>
          <div class="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
            {#if queuedSong.albumArt}
              <img src={queuedSong.albumArt} alt={queuedSong.title} class="w-12 h-12 rounded object-cover flex-shrink-0" />
            {:else}
              <div class="w-12 h-12 rounded bg-muted flex-shrink-0"></div>
            {/if}
            <div class="min-w-0 flex-1">
              <p class="font-medium text-sm truncate text-foreground">{queuedSong.title}</p>
              <p class="text-xs text-muted-foreground truncate">{queuedSong.artists}</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {formatDuration(queuedSong.durationMs)} · {t.addedBy} {queuedSong.addedByName ?? 'Guest'}
              </p>
            </div>
            <span class="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mr-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              {t.locked}
            </span>
          </div>
        </div>
      {/if}

      <!-- Pending voting queue -->
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        {t.queue} · {pendingQueue.length} {pendingQueue.length === 1 ? t.song : t.songs}
      </p>

      {#if pendingQueue.length === 0 && !queuedSong}
        <div class="text-center py-12 text-muted-foreground">
          <p class="text-lg">{t.emptyQueue}</p>
          <p class="text-sm mt-1">{t.emptyQueueSub}</p>
        </div>
      {:else if pendingQueue.length === 0}
        <p class="text-sm text-muted-foreground py-4 text-center">{$lang === 'en' ? 'No more songs to vote on' : 'No hay más canciones para votar'}</p>
      {:else}
        <ul class="space-y-2">
          {#each pendingQueue as song, i (song.id)}
            <li class="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <span class="text-xs text-muted-foreground w-5 text-center flex-shrink-0">{i + 1}</span>
              {#if song.albumArt}
                <img src={song.albumArt} alt={song.title} class="w-12 h-12 rounded object-cover flex-shrink-0" />
              {:else}
                <div class="w-12 h-12 rounded bg-muted flex-shrink-0"></div>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="font-medium text-sm truncate text-foreground">{song.title}</p>
                <p class="text-xs text-muted-foreground truncate">{song.artists}</p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {formatDuration(song.durationMs)} · {t.addedBy} {song.addedByName ?? 'Guest'}
                </p>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  onclick={() => vote(song.id, 1)}
                  class="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors
                    {song.myVote === 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'}"
                >▲</button>
                <span class="text-sm font-semibold w-6 text-center text-foreground">
                  {song.voteScore > 0 ? '+' : ''}{song.voteScore}
                </span>
                <button
                  onclick={() => vote(song.id, -1)}
                  class="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors
                    {song.myVote === -1
                      ? 'bg-red-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-red-500/20 hover:text-red-500'}"
                >▼</button>
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
