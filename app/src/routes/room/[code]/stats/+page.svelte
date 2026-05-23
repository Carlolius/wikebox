<script lang="ts">
  let { data } = $props();

  function formatDate(ts: Date | number | null): string {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head>
  <title>{data.room.name} · Estadísticas · Wikebox</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <header class="border-b border-border px-6 py-4 flex items-center gap-4">
    <a href="/room/{data.room.id}" class="text-muted-foreground hover:text-foreground text-sm">← Volver</a>
    <div>
      <h1 class="text-xl font-bold text-foreground">Estadísticas</h1>
      <p class="text-sm text-muted-foreground">{data.room.name}</p>
    </div>
  </header>

  <div class="max-w-3xl mx-auto p-6 space-y-8">

    <!-- Summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div class="rounded-xl border border-border bg-card p-5">
        <p class="text-xs text-muted-foreground uppercase tracking-wide">Canciones reproducidas</p>
        <p class="text-4xl font-black text-foreground mt-1">{data.totalPlayed}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <p class="text-xs text-muted-foreground uppercase tracking-wide">En cola ahora</p>
        <p class="text-4xl font-black text-foreground mt-1">{data.queueLength}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 col-span-2 sm:col-span-1">
        <p class="text-xs text-muted-foreground uppercase tracking-wide">Colaboradores</p>
        <p class="text-4xl font-black text-foreground mt-1">{data.contributors.length}</p>
      </div>
    </div>

    <!-- Most voted song in queue -->
    {#if data.topQueued}
      <section class="space-y-3">
        <h2 class="text-base font-semibold text-foreground">Canción más votada en cola</h2>
        <div class="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          {#if data.topQueued.albumArt}
            <img src={data.topQueued.albumArt} alt={data.topQueued.title} class="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
          {:else}
            <div class="w-16 h-16 rounded-lg bg-muted flex-shrink-0"></div>
          {/if}
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-foreground truncate">{data.topQueued.title}</p>
            <p class="text-sm text-muted-foreground truncate">{data.topQueued.artists}</p>
          </div>
          <div class="flex-shrink-0 text-right">
            <span class="text-2xl font-black {data.topQueued.voteScore > 0 ? 'text-primary' : 'text-muted-foreground'}">
              {data.topQueued.voteScore > 0 ? '+' : ''}{data.topQueued.voteScore}
            </span>
            <p class="text-xs text-muted-foreground">votos</p>
          </div>
        </div>
      </section>
    {/if}

    <!-- Top contributors -->
    {#if data.contributors.length > 0}
      <section class="space-y-3">
        <h2 class="text-base font-semibold text-foreground">Top colaboradores</h2>
        <ul class="space-y-2">
          {#each data.contributors as c, i (c.addedBy)}
            <li class="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
              <span class="text-2xl font-black text-muted-foreground/30 w-8 text-right flex-shrink-0">{i + 1}</span>
              <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold text-primary">{(c.name ?? 'G')[0].toUpperCase()}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-foreground truncate">{c.name ?? 'Guest'}</p>
              </div>
              <div class="flex-shrink-0 text-right space-y-0.5">
                <p class="text-sm font-semibold text-foreground">{c.songCount} canciones</p>
                <p class="text-xs text-muted-foreground">{c.totalVotes > 0 ? '+' : ''}{c.totalVotes} votos totales</p>
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- Top songs played -->
    {#if data.topSongs.length > 0}
      <section class="space-y-3">
        <h2 class="text-base font-semibold text-foreground">Canciones más votadas (historial)</h2>
        <ul class="space-y-2">
          {#each data.topSongs as song, i (i)}
            <li class="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <span class="text-sm text-muted-foreground w-5 text-center flex-shrink-0">{i + 1}</span>
              {#if song.albumArt}
                <img src={song.albumArt} alt={song.title} class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              {:else}
                <div class="w-12 h-12 rounded-lg bg-muted flex-shrink-0"></div>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="font-medium text-sm text-foreground truncate">{song.title}</p>
                <p class="text-xs text-muted-foreground truncate">{song.artists}</p>
                <p class="text-xs text-muted-foreground mt-0.5">{formatDate(song.playedAt)} · por {song.addedByName ?? 'Guest'}</p>
              </div>
              <div class="flex-shrink-0">
                <span class="text-sm font-bold {song.totalVotes > 0 ? 'text-primary' : 'text-muted-foreground'}">
                  {song.totalVotes > 0 ? '+' : ''}{song.totalVotes}
                </span>
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {:else}
      <div class="text-center py-16 text-muted-foreground">
        <p class="text-lg">Sin historial todavía</p>
        <p class="text-sm mt-1">Las canciones aparecerán aquí una vez reproducidas</p>
      </div>
    {/if}

  </div>
</div>
