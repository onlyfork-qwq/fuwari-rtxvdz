<script lang="ts">
  import { onMount } from "svelte";

  const UMAMI_CONFIG = {
    shareUrl: "https://cloud.umami.is/analytics/eu/share/XeYUcCrfM8jEYfa6",
  };

  const FALLBACK_STATS = { pageviews: 1000, visits: 1000, visitors: 1000 };

  let pageviews = "-";
  let visits = "-";
  let visitors = "-";
  let shareLink = "";

  function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return Math.round(num).toString();
  }

  function setStats(values: { pageviews: number; visits: number; visitors: number }) {
    pageviews = formatNumber(values.pageviews);
    visits = formatNumber(values.visits);
    visitors = formatNumber(values.visitors);
  }

  interface UmamiInternal {
    baseUrl: string;
    websiteId: string;
    shareToken: string;
    shareId: string;
    isReady: boolean;
  }

  let internal: UmamiInternal = {
    baseUrl: "",
    websiteId: "",
    shareToken: "",
    shareId: "",
    isReady: false,
  };

  async function initConfig(): Promise<boolean> {
    try {
      const sharePath = UMAMI_CONFIG.shareUrl.split("/share/")[1];
      if (!sharePath) throw new Error("Invalid Umami Share URL");

      const region = UMAMI_CONFIG.shareUrl.includes("/analytics/eu/") ? "eu" : "us";
      const apiBase = `https://cloud.umami.is/analytics/${region}/api`;

      const res = await fetch(`${apiBase}/share/${sharePath}`);
      const data = await res.json();

      internal = {
        baseUrl: apiBase,
        websiteId: data.websiteId,
        shareToken: data.token,
        shareId: data.shareId,
        isReady: true,
      };
      shareLink = UMAMI_CONFIG.shareUrl;
      return true;
    } catch (e) {
      console.error("Umami Config Init Failed:", e);
      return false;
    }
  }

  async function fetchStats() {
    if (!internal.isReady) {
      const ok = await initConfig();
      if (!ok) {
        setStats(FALLBACK_STATS);
        return;
      }
    }

    try {
      const endAt = Date.now();
      const url = `${internal.baseUrl}/websites/${internal.websiteId}/stats?startAt=0&endAt=${endAt}&unit=hour&timezone=Asia%2FShanghai`;

      const response = await fetch(url, {
        headers: {
          "x-umami-share-context": "1",
          "x-umami-share-token": internal.shareToken,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const getValue = (field: any) => (typeof field === "object" ? field?.value : field) || 0;

      setStats({
        pageviews: getValue(data.pageviews),
        visits: getValue(data.visits),
        visitors: getValue(data.visitors),
      });
    } catch (error) {
      console.error("Umami Fetch Failed:", error);
      setStats(FALLBACK_STATS);
    }
  }

  onMount(() => {
    const container = document.getElementById("umami-stats");
    if (!container) {
      fetchStats();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchStats();
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(container);

    if (window.swup) {
      window.swup.hooks.on("page:view", () => {
        const c = document.getElementById("umami-stats");
        if (c) {
          const newIo = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                fetchStats();
                newIo.disconnect();
              }
            },
            { threshold: 0.1 },
          );
          newIo.observe(c);
        }
      });
    }
  });
</script>

<widget-layout
  data-id="umami-stats"
  data-is-collapsed="false"
  class="pb-4 card-base cursor-pointer transition-opacity active:scale-95 onload-animation"
  style="animation-delay: 200ms"
>
  <div class="font-bold transition text-lg text-neutral-900 dark:text-neutral-100 relative ml-8 mt-4 mb-2 before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)] before:absolute before:left-[-16px] before:top-[5.5px]">
    统计
  </div>
  <div id="umami-stats" class="collapse-wrapper px-4 overflow-hidden">
    <a href={shareLink} target="_blank" rel="noopener noreferrer" class="block">
      <div class="text-center py-2">
        <div class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{pageviews}</div>
        <div class="text-sm text-neutral-500 dark:text-neutral-400">总浏览量</div>
      </div>
      <div class="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-700 text-center pt-2">
        <div class="px-2">
          <div class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{visits}</div>
          <div class="text-sm text-neutral-500 dark:text-neutral-400">访问数</div>
        </div>
        <div class="px-2">
          <div class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{visitors}</div>
          <div class="text-sm text-neutral-500 dark:text-neutral-400">游客数</div>
        </div>
      </div>
    </a>
  </div>
</widget-layout>
