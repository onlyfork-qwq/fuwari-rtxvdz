<script lang="ts">
  import { profileConfig } from "../../config";
  import { url } from "../../utils/url-utils";
  import TypedBio from "./TypedBio.svelte";
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  const config = profileConfig;

  // 每次挂载生成带时间戳的头像 URL，防止浏览器缓存
  let avatarSrc = "";

  onMount(() => {
    const separator = config.avatar.includes("?") ? "&" : "?";
    avatarSrc = `${config.avatar}${separator}t=${Date.now()}`;
  });
</script>

<div class="card-base p-3">
  <a aria-label="Go to About Page" href={url('/about/')}
     class="group block relative mx-auto mt-1 lg:mx-0 lg:mt-0 mb-3
     max-w-[12rem] lg:max-w-none overflow-hidden rounded-xl active:scale-95">
    <div class="absolute transition pointer-events-none group-hover:bg-black/30 group-active:bg-black/50
    w-full h-full z-50 flex items-center justify-center">
      <Icon icon="fa6-regular:address-card" class="transition opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-100 text-white text-5xl" />
    </div>
    <img src={avatarSrc} alt="Profile Image of the Author" class="mx-auto lg:w-full h-full lg:mt-0" />
  </a>
  <div class="px-2">
    <div class="font-bold text-xl text-center mb-1 dark:text-neutral-50 transition">{config.name}</div>
    <div class="h-1 w-5 bg-[var(--primary)] mx-auto rounded-full mb-2 transition"></div>
    <div class="text-center text-neutral-400 mb-2.5 transition min-h-[1.5em]">
      {#if config.bioFile}
        <TypedBio filePath={config.bioFile} />
      {/if}
    </div>
    <div class="flex flex-wrap gap-2 justify-center mb-1">
      {#if config.links.length > 1}
        {#each config.links as item}
          <a rel="me" aria-label={item.name} href={item.url} target="_blank" class="btn-regular rounded-lg h-10 w-10 active:scale-90">
            <Icon icon={item.icon} class="text-[1.5rem]" />
          </a>
        {/each}
      {:else if config.links.length === 1}
        <a rel="me" aria-label={config.links[0].name} href={config.links[0].url} target="_blank"
          class="btn-regular rounded-lg h-10 gap-2 px-3 font-bold active:scale-95">
          <Icon icon={config.links[0].icon} class="text-[1.5rem]" />
          {config.links[0].name}
        </a>
      {/if}
    </div>
  </div>
</div>