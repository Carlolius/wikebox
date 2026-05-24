<script lang="ts">
  interface Device {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
  }

  interface Room {
    id: string;
    name: string;
    adminId: string;
    playbackMode: 'sdk' | 'connect';
    djMode: boolean;
    creditsEnabled: boolean;
    creditsPerHour: number;
    skipThreshold: number;
    genreFilter: string | null;
    activeDeviceId: string | null;
    welcomeMessage: string | null;
  }

  let { data } = $props();
  let room = $state<Room>(data.room as Room);
  const shareUrl = data.shareUrl as string;
  const qrDataUrl = data.qrDataUrl as string;

  let devices = $state<Device[]>([]);
  let loadingDevices = $state(false);
  let saving = $state(false);
  let savedMsg = $state('');

  let playbackMode = $state<'sdk' | 'connect'>(room.playbackMode);
  let djMode = $state(room.djMode);
  let creditsEnabled = $state(room.creditsEnabled);
  let creditsPerHour = $state(room.creditsPerHour);
  let skipThreshold = $state(room.skipThreshold);
  let genreFilter = $state(room.genreFilter ?? '');
  let selectedDeviceId = $state(room.activeDeviceId ?? '');
  let welcomeMessage = $state(room.welcomeMessage ?? '');

  // Blacklist
  let blacklistSearch = $state('');
  let blacklistResults = $state<{ uri: string; name: string; artists: string; albumArt: string | null }[]>([]);
  let searchingBlacklist = $state(false);
  let addingToBlacklist = $state(false);
  let artistBlacklist = $state('');

  // History / playlist export
  let exportingPlaylist = $state(false);
  let playlistName = $state(`${room.name} - Wikebox`);
  let exportMsg = $state('');


  async function loadDevices() {
    loadingDevices = true;
    try {
      const res = await fetch(`/api/spotify/devices?room=${room.id}`);
      if (res.ok) devices = await res.json() as Device[];
    } finally {
      loadingDevices = false;
    }
  }

  async function selectDevice(deviceId: string) {
    const res = await fetch('/api/spotify/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id, deviceId })
    });
    if (res.ok) {
      selectedDeviceId = deviceId;
      savedMsg = 'Dispositivo seleccionado';
      setTimeout(() => (savedMsg = ''), 2000);
    }
  }

  async function saveSettings() {
    saving = true;
    savedMsg = '';
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbackMode,
          djMode,
          creditsEnabled,
          creditsPerHour,
          skipThreshold,
          genreFilter: genreFilter.trim() || null,
          welcomeMessage: welcomeMessage.trim() || null
        })
      });
      if (res.ok) {
        savedMsg = 'Configuración guardada';
        setTimeout(() => (savedMsg = ''), 3000);
      }
    } finally {
      saving = false;
    }
  }

  let blacklistTimer: ReturnType<typeof setTimeout> | null = null;
  function onBlacklistInput() {
    if (blacklistTimer) clearTimeout(blacklistTimer);
    if (!blacklistSearch.trim()) {
      blacklistResults = [];
      return;
    }
    blacklistTimer = setTimeout(() => doBlacklistSearch(blacklistSearch), 400);
  }

  async function doBlacklistSearch(q: string) {
    searchingBlacklist = true;
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}&room=${room.id}`);
      if (res.ok) {
        const tracks = await res.json() as { uri: string; name: string; artists: string; albumArt: string | null }[];
        blacklistResults = tracks;
      }
    } finally {
      searchingBlacklist = false;
    }
  }

  async function addToBlacklist(spotifyUri: string) {
    addingToBlacklist = true;
    try {
      await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, spotifyUri })
      });
      blacklistSearch = '';
      blacklistResults = [];
      savedMsg = 'Añadido a la lista negra';
      setTimeout(() => (savedMsg = ''), 2000);
    } finally {
      addingToBlacklist = false;
    }
  }

  async function addArtistToBlacklist() {
    if (!artistBlacklist.trim()) return;
    addingToBlacklist = true;
    try {
      await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, artistName: artistBlacklist.trim() })
      });
      artistBlacklist = '';
      savedMsg = 'Artista añadido a la lista negra';
      setTimeout(() => (savedMsg = ''), 2000);
    } finally {
      addingToBlacklist = false;
    }
  }

  async function exportPlaylist() {
    if (!playlistName.trim()) return;
    exportingPlaylist = true;
    exportMsg = '';
    try {
      const res = await fetch(`/api/rooms/${room.id}/export-playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playlistName })
      });
      if (res.ok) {
        const { playlistId } = await res.json() as { playlistId: string };
        exportMsg = `Playlist creada: https://open.spotify.com/playlist/${playlistId}`;
      } else {
        exportMsg = 'Error al crear la playlist';
      }
    } finally {
      exportingPlaylist = false;
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl);
    savedMsg = '¡Enlace copiado!';
    setTimeout(() => (savedMsg = ''), 2000);
  }

  $effect(() => {
    if (playbackMode === 'connect') {
      loadDevices();
    }
  });
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b border-border px-6 py-4 flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-foreground">Panel de administración</h1>
      <p class="text-sm text-muted-foreground">{room.name} · <span class="text-xs text-muted-foreground/70">La configuración puede cambiarse en cualquier momento.</span></p>
    </div>
    <a
      href="/room/{room.id}"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
    >
      Ir a la sala
    </a>
  </header>

  <div class="max-w-2xl mx-auto p-6 space-y-8">

    <!-- Share link -->
    <section class="space-y-3">
      <h2 class="text-base font-semibold text-foreground">Compartir sala</h2>
      <div class="flex gap-2">
        <input
          readonly
          value={shareUrl}
          class="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm font-mono"
        />
        <button
          onclick={copyShareLink}
          class="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          Copiar
        </button>
      </div>
      <div class="flex items-center gap-4">
        <img src={qrDataUrl} alt="QR sala {room.id}" class="w-24 h-24 rounded-lg border border-border" />
        <div class="text-sm text-muted-foreground space-y-1">
          <p>Código de sala:</p>
          <p class="text-3xl font-bold font-mono text-foreground tracking-widest">{room.id}</p>
          <a href="/room/{room.id}/stats" class="text-xs underline text-muted-foreground hover:text-foreground">
            Ver estadísticas →
          </a>
        </div>
      </div>
    </section>

    <hr class="border-border" />

    <!-- Welcome message -->
    <section class="space-y-3">
      <h2 class="text-base font-semibold text-foreground">Mensaje de bienvenida</h2>
      <p class="text-xs text-muted-foreground">Se muestra en la sala al entrar. Déjalo vacío para no mostrar nada.</p>
      <input
        bind:value={welcomeMessage}
        placeholder=""
        class="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
      />
    </section>

    <hr class="border-border" />

    <!-- Playback mode -->
    <section class="space-y-3">
      <h2 class="text-base font-semibold text-foreground">Modo de reproducción</h2>
      <div class="grid grid-cols-2 gap-3">
        <button
          onclick={() => (playbackMode = 'sdk')}
          class="rounded-lg border-2 p-4 text-left transition-colors
            {playbackMode === 'sdk' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
        >
          <p class="font-medium text-sm text-foreground">Este navegador</p>
          <p class="text-xs text-muted-foreground mt-1">Web Playback SDK — requiere Spotify Premium</p>
        </button>
        <button
          onclick={() => (playbackMode = 'connect')}
          class="rounded-lg border-2 p-4 text-left transition-colors
            {playbackMode === 'connect' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
        >
          <p class="font-medium text-sm text-foreground">Dispositivo externo</p>
          <p class="text-xs text-muted-foreground mt-1">Spotify Connect — cualquier dispositivo activo</p>
        </button>
      </div>

      <!-- Device selector (connect mode) -->
      {#if playbackMode === 'connect'}
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-foreground">Dispositivo activo</p>
            <button
              onclick={loadDevices}
              disabled={loadingDevices}
              class="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {loadingDevices ? 'Cargando…' : 'Actualizar'}
            </button>
          </div>
          {#if devices.length === 0 && !loadingDevices}
            <p class="text-sm text-muted-foreground">No hay dispositivos activos. Abre Spotify en algún dispositivo.</p>
          {:else}
            <ul class="space-y-1">
              {#each devices as device (device.id)}
                <li>
                  <button
                    onclick={() => selectDevice(device.id)}
                    class="w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left
                      {selectedDeviceId === device.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}"
                  >
                    <span class="text-lg">{device.type === 'Computer' ? '💻' : device.type === 'Smartphone' ? '📱' : '🔊'}</span>
                    <div>
                      <p class="text-sm font-medium text-foreground">{device.name}</p>
                      <p class="text-xs text-muted-foreground">{device.type}{device.isActive ? ' · activo' : ''}</p>
                    </div>
                    {#if selectedDeviceId === device.id}
                      <span class="ml-auto text-primary text-sm">✓</span>
                    {/if}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
    </section>

    <hr class="border-border" />

    <!-- DJ Mode -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-foreground">Modo DJ</h2>
          <p class="text-xs text-muted-foreground mt-0.5">Las canciones no se añaden automáticamente a Spotify. El admin controla cuándo suena cada canción desde esta pantalla.</p>
        </div>
        <button
          role="switch"
          aria-checked={djMode}
          onclick={() => (djMode = !djMode)}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4
            {djMode ? 'bg-primary' : 'bg-muted'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
              {djMode ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>
    </section>

    <hr class="border-border" />

    <!-- Credits -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-foreground">Créditos</h2>
          <p class="text-xs text-muted-foreground mt-0.5">Limita cuántas canciones puede añadir cada usuario por hora</p>
        </div>
        <button
          role="switch"
          aria-checked={creditsEnabled}
          onclick={() => (creditsEnabled = !creditsEnabled)}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4
            {creditsEnabled ? 'bg-primary' : 'bg-muted'}"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
              {creditsEnabled ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>

      {#if creditsEnabled}
        <div class="space-y-1">
          <label class="text-sm font-medium text-foreground" for="credits-per-hour">
            Créditos por hora: <strong>{creditsPerHour}</strong>
          </label>
          <input
            id="credits-per-hour"
            type="range"
            min="1"
            max="20"
            bind:value={creditsPerHour}
            class="w-full accent-primary"
          />
        </div>
      {/if}
    </section>

    <hr class="border-border" />

    <!-- Skip threshold -->
    <section class="space-y-3">
      <h2 class="text-base font-semibold text-foreground">Umbral de skip</h2>
      <p class="text-xs text-muted-foreground">Porcentaje de usuarios activos que deben votar para saltar una canción</p>
      <div class="space-y-1">
        <label class="text-sm font-medium text-foreground" for="skip-threshold">
          Umbral: <strong>{skipThreshold}%</strong>
        </label>
        <input
          id="skip-threshold"
          type="range"
          min="10"
          max="100"
          step="5"
          bind:value={skipThreshold}
          class="w-full accent-primary"
        />
      </div>
    </section>

    <hr class="border-border" />

    <!-- Genre filter -->
    <section class="space-y-3">
      <h2 class="text-base font-semibold text-foreground">Filtro de géneros</h2>
      <p class="text-xs text-muted-foreground">Géneros separados por coma que se bloquearán (ej: reggaeton, trap)</p>
      <input
        bind:value={genreFilter}
        placeholder=""
        class="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
      />
    </section>

    <hr class="border-border" />

    <!-- Blacklist -->
    <section class="space-y-4">
      <h2 class="text-base font-semibold text-foreground">Lista negra</h2>

      <div class="space-y-2">
        <p class="text-sm font-medium text-foreground">Bloquear canción</p>
        <div class="relative">
          <input
            bind:value={blacklistSearch}
            oninput={onBlacklistInput}
            placeholder="Buscar canción para bloquear…"
            class="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
          {#if searchingBlacklist}
            <div class="absolute right-2 top-2.5 h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          {/if}
        </div>
        {#if blacklistResults.length > 0}
          <ul class="space-y-1 border border-border rounded-md overflow-hidden">
            {#each blacklistResults as track (track.uri)}
              <li class="flex items-center gap-2 p-2 hover:bg-muted">
                {#if track.albumArt}
                  <img src={track.albumArt} alt={track.name} class="w-8 h-8 rounded object-cover" />
                {/if}
                <div class="min-w-0 flex-1">
                  <p class="text-sm truncate text-foreground">{track.name}</p>
                  <p class="text-xs text-muted-foreground truncate">{track.artists}</p>
                </div>
                <button
                  onclick={() => addToBlacklist(track.uri)}
                  disabled={addingToBlacklist}
                  class="flex-shrink-0 text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  Bloquear
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="space-y-2">
        <p class="text-sm font-medium text-foreground">Bloquear artista</p>
        <div class="flex gap-2">
          <input
            bind:value={artistBlacklist}
            placeholder="Nombre del artista"
            class="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm"
            onkeydown={(e) => e.key === 'Enter' && addArtistToBlacklist()}
          />
          <button
            onclick={addArtistToBlacklist}
            disabled={addingToBlacklist || !artistBlacklist.trim()}
            class="rounded-md bg-red-500 text-white px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            Bloquear
          </button>
        </div>
      </div>
    </section>

    <hr class="border-border" />

    <!-- Export playlist -->
    <section class="space-y-3">
      <h2 class="text-base font-semibold text-foreground">Guardar sesión como playlist</h2>
      <p class="text-xs text-muted-foreground">Crea una playlist de Spotify con el historial de canciones de esta sala</p>
      <div class="flex gap-2">
        <input
          bind:value={playlistName}
          placeholder="Nombre de la playlist"
          class="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm"
        />
        <button
          onclick={exportPlaylist}
          disabled={exportingPlaylist || !playlistName.trim()}
          class="rounded-md bg-[#1DB954] text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {exportingPlaylist ? 'Creando…' : 'Crear'}
        </button>
      </div>
      {#if exportMsg}
        <p class="text-sm {exportMsg.startsWith('Error') ? 'text-red-500' : 'text-primary'}">{exportMsg}</p>
      {/if}
    </section>

    <!-- Save settings -->
    <div class="flex items-center justify-between pt-2 pb-8">
      {#if savedMsg}
        <p class="text-sm text-primary font-medium">{savedMsg}</p>
      {:else}
        <div></div>
      {/if}
      <button
        onclick={saveSettings}
        disabled={saving}
        class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>

  </div>
</div>
