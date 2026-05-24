<script lang="ts">
  import { authClient } from '$lib/auth-client';
  import { goto } from '$app/navigation';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  const session = authClient.useSession();
  const lang = getContext<Writable<'es' | 'en'>>('lang');

  let roomName = $state('');
  let roomCode = $state('');
  let creating = $state(false);
  let errorMsg = $state('');

  const t = $derived({
    joinTitle: $lang === 'es' ? 'Unirse a una sala' : 'Join a room',
    joinPlaceholder: 'abc123',
    joinBtn: $lang === 'es' ? 'Entrar' : 'Enter',
    or: $lang === 'es' ? '— o —' : '— or —',
    createTitle: $lang === 'es' ? 'Crear una sala' : 'Create a room',
    connectedAs: $lang === 'es' ? 'Conectado como' : 'Connected as',
    roomNamePlaceholder: $lang === 'es' ? 'Nombre de la sala' : 'Room name',
    createBtn: $lang === 'es' ? 'Crear sala' : 'Create room',
    creating: $lang === 'es' ? 'Creando…' : 'Creating…',
    connectSpotify: $lang === 'es' ? 'Conectar con Spotify' : 'Connect with Spotify',
  });

  async function createRoom() {
    if (!roomName.trim()) return;
    creating = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, playbackMode: 'sdk' })
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json() as { id: string };
      goto(`/room/${id}/admin`);
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Error creating room';
    } finally {
      creating = false;
    }
  }

  async function joinRoom() {
    if (!roomCode.trim()) return;
    goto(`/room/${roomCode.trim().toLowerCase()}`);
  }

  function loginWithSpotify() {
    authClient.signIn.social({ provider: 'spotify', callbackURL: '/' });
  }
</script>

<main class="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-10">
  <div class="text-center">
    <h1 class="text-5xl font-bold tracking-tight text-foreground">Wikebox</h1>
  </div>

  <!-- Join a room -->
  <div class="w-full max-w-sm space-y-2">
    <h2 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.joinTitle}</h2>
    <div class="flex gap-2">
      <input
        bind:value={roomCode}
        placeholder={t.joinPlaceholder}
        class="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm"
        onkeydown={(e) => e.key === 'Enter' && joinRoom()}
      />
      <button
        onclick={joinRoom}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {t.joinBtn}
      </button>
    </div>
  </div>

  <div class="text-muted-foreground text-sm">{t.or}</div>

  <!-- Create a room (requires Spotify login) -->
  <div class="w-full max-w-sm space-y-3">
    <h2 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.createTitle}</h2>
    {#if $session?.data?.user}
      <p class="text-sm text-muted-foreground">{t.connectedAs} <strong>{$session.data.user.name}</strong></p>
      <input
        bind:value={roomName}
        placeholder={t.roomNamePlaceholder}
        class="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
        onkeydown={(e) => e.key === 'Enter' && createRoom()}
      />
      {#if errorMsg}
        <p class="text-sm text-red-500">{errorMsg}</p>
      {/if}
      <button
        onclick={createRoom}
        disabled={creating || !roomName.trim()}
        class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {creating ? t.creating : t.createBtn}
      </button>
    {:else}
      <button
        onclick={loginWithSpotify}
        class="w-full flex items-center justify-center gap-3 rounded-md bg-[#1DB954] px-4 py-3 text-sm font-medium text-white"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
        {t.connectSpotify}
      </button>
    {/if}
  </div>
</main>
