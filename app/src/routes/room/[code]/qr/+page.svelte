<script lang="ts">
  let { data } = $props();
  const displayUrl = (data.shareUrl as string).replace(/^https?:\/\//, '');
</script>

<svelte:head>
  <title>QR · {data.room.name} · Wikebox</title>
</svelte:head>

<div class="min-h-screen bg-black flex flex-col items-center justify-center gap-10 p-8">
  <img
    src={data.qrDataUrl}
    alt="QR sala {data.room.id}"
    class="w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-3xl shadow-2xl"
    style="box-shadow: 0 0 80px rgba(255,255,255,0.08);"
  />
  <div class="text-center space-y-3">
    <p class="text-7xl font-black font-mono tracking-[0.3em] text-white">{data.room.id}</p>
    <p class="text-white/40 text-lg font-mono">{displayUrl}</p>
    {#if data.room.name}
      <p class="text-white/20 text-base">{data.room.name}</p>
    {/if}
  </div>
</div>
