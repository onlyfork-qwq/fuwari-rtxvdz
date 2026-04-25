<script lang="ts">
  import WidgetLayout from "./WidgetLayout.svelte";

  interface Props {
    class?: string;
    style?: string;
  }

  let { class: className, style } = $props<Props>();
  let pageviews = 0;
  let visits = 0;
  let visitors = 0;
  let shareUrl = 'https://cloud.umami.is/analytics/eu/share/XeYUcCrfM8jEYfa6';

  const FALLBACK_STATS = {
    pageviews: 1000,
    visits: 1000,
    visitors: 1000,
  };

  let __UMAMI_INTERNAL = {
    baseUrl: '',
    websiteId: '',
    shareToken: '',
    shareId: '',
    isReady: false
  };

  async function initUmamiConfig() {
    try {
      const sharePath = shareUrl.split('/share/')[1];
      if (!sharePath) throw new Error('Invalid Umami Share URL');

      const region = shareUrl.includes('/analytics/eu/') ? 'eu' : 'us';
      const apiBase = `https://cloud.umami.is/analytics/${region}/api`;

      const res = await fetch(`${apiBase}/share/${sharePath}`);
      const data = await res.json();

      __UMAMI_INTERNAL = {
        baseUrl: apiBase,
        websiteId: data.websiteId,
        shareToken: data.token,
        shareId: data.shareId,
        isReady: true
      };

    } catch (e) {
      console.error('Umami Config Init Failed:', e);
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toString();
  }

  function setStats(values: { pageviews: number; visits: number; visitors: number }) {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const animHandles = new Map<number, number>();

    const animateStat = (target: number, setter: (value: number) => void, duration = 2000) => {
      const from = 0;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = easeOutCubic(progress);

        const current = from + (target - from) * easedProgress;
        setter(current);

        if (progress < 1) {
          const id = requestAnimationFrame(tick);
          animHandles.set(target, id);
        }
      };
      const id = requestAnimationFrame(tick);
      animHandles.set(target, id);
    };

    animateStat(values.pageviews, (value) => pageviews = value);
    animateStat(values.visits, (value) => visits = value);
    animateStat(values.visitors, (value) => visitors = value);
  }

  async function fetchUmamiStats() {
    if (!__UMAMI_INTERNAL.isReady) {
      await initUmamiConfig();
    }

    if (!__UMAMI_INTERNAL.isReady) {
      setStats(FALLBACK_STATS);
      return;
    }

    try {
      const endAt = Date.now();
      const startAt = 0;
      const url = `${__UMAMI_INTERNAL.baseUrl}/websites/${__UMAMI_INTERNAL.websiteId}/stats?startAt=${startAt}&endAt=${endAt}&unit=hour&timezone=Asia%2FShanghai`;

      const response = await fetch(url, {
        headers: {
          'x-umami-share-context': '1',
          'x-umami-share-token': __UMAMI_INTERNAL.shareToken
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const getValue = (field: any) => (typeof field === 'object' ? field?.value : field) || 0;

      setStats({
        pageviews: getValue(data.pageviews),
        visits: getValue(data.visits),
        visitors: getValue(data.visitors),
      });

    } catch (error) {
      console.error('Umami Fetch Failed:', error);
      setStats(FALLBACK_STATS);
    }
  }

  let __umamiStatsStarted = false;
  function startUmamiStats() {
    if (__umamiStatsStarted) return;
    __umamiStatsStarted = true;
    fetchUmamiStats();
  }

  function initUmamiStatsVisibility() {
    const container = document.getElementById('umami-stats');
    if (!container) return;

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startUmamiStats();
        io.disconnect();
      }
    }, { threshold: 0.1 });

    io.observe(container);
  }

  // 组件挂载时初始化
  onMount(() => {
    initUmamiStatsVisibility();

    // 处理swup页面切换
    if (window.swup) {
      window.swup.hooks.on('page:view', () => {
        __umamiStatsStarted = false;
        initUmamiStatsVisibility();
      });
    }
  });

  import { onMount } from 'svelte';
</script>

<WidgetLayout name="统计" id="umami-stats" class={`${className} cursor-pointer transition-opacity active:scale-95`} {style}>
  <a href={shareUrl} target="_blank" rel="noopener noreferrer" class="block">
    <div class="text-center py-2">
      <div class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(pageviews)}</div>
      <div class="text-sm text-neutral-500 dark:text-neutral-400">总浏览量</div>
    </div>
    <div class="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-700 text-center pt-2">
      <div class="px-2">
        <div class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(visits)}</div>
        <div class="text-sm text-neutral-500 dark:text-neutral-400">访问数</div>
      </div>
      <div class="px-2">
        <div class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(visitors)}</div>
        <div class="text-sm text-neutral-500 dark:text-neutral-400">游客数</div>
      </div>
    </div>
  </a>
</WidgetLayout>
