<script lang="ts">
import Icon from "@iconify/svelte";

let inputUrl = "";
let outputUrl = "";
let selectedSource = "gh-proxy";
let toastMsg = "";
let toastVisible = false;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function generate() {
	const val = inputUrl.trim();
	if (!val) {
		showToast("请先输入链接");
		return;
	}
	if (selectedSource === "gh-proxy") {
		outputUrl = `https://gh-proxy.com/${val}`;
	} else {
		outputUrl = val.replace("github.com", "gh.2x.nz");
	}
}

function copy() {
	if (!outputUrl) {
		showToast("请先生成链接");
		return;
	}
	navigator.clipboard
		.writeText(outputUrl)
		.then(() => {
			showToast("已复制到剪贴板");
		})
		.catch(() => {
			// fallback
			const ta = document.createElement("textarea");
			ta.value = outputUrl;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			document.body.removeChild(ta);
			showToast("已复制到剪贴板");
		});
}

function download() {
	if (!outputUrl) return;
	window.open(outputUrl, "_blank");
}

function clearAll() {
	inputUrl = "";
	outputUrl = "";
}

function showToast(msg: string) {
	toastMsg = msg;
	toastVisible = true;
	if (toastTimer) clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		toastVisible = false;
	}, 1500);
}
</script>

<div class="card-base z-10 px-6 md:px-9 py-6 relative w-full">
  <div class="flex items-center gap-2 mb-6">
    <Icon icon="mdi:github" class="text-2xl text-[var(--primary)]" />
    <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">GitHub 反代链接生成器</h1>
  </div>
  <p class="text-neutral-500 dark:text-neutral-400 mb-6">输入 GitHub 原始链接，选择反代源，点击生成</p>

  <div class="space-y-5">
    <!-- 反代源选择按钮 -->
    <div>
      <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">反代源</label>
      <div class="flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg font-medium border-2 transition-all active:scale-95"
          class:bg-[var(--primary)]={selectedSource === "gh-proxy"}
          class:text-white={selectedSource === "gh-proxy"}
          class:border-[var(--primary)]={selectedSource === "gh-proxy"}
          class:bg-neutral-100={selectedSource !== "gh-proxy"}
          class:dark:bg-neutral-800={selectedSource !== "gh-proxy"}
          class:border-neutral-200={selectedSource !== "gh-proxy"}
          class:dark:border-neutral-700={selectedSource !== "gh-proxy"}
          class:text-neutral-900={selectedSource !== "gh-proxy"}
          class:dark:text-neutral-100={selectedSource !== "gh-proxy"}
          on:click={() => { selectedSource = "gh-proxy"; }}
        >
          gh-proxy.com
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-lg font-medium border-2 transition-all active:scale-95"
          class:bg-[var(--primary)]={selectedSource === "gh-2xnz"}
          class:text-white={selectedSource === "gh-2xnz"}
          class:border-[var(--primary)]={selectedSource === "gh-2xnz"}
          class:bg-neutral-100={selectedSource !== "gh-2xnz"}
          class:dark:bg-neutral-800={selectedSource !== "gh-2xnz"}
          class:border-neutral-200={selectedSource !== "gh-2xnz"}
          class:dark:border-neutral-700={selectedSource !== "gh-2xnz"}
          class:text-neutral-900={selectedSource !== "gh-2xnz"}
          class:dark:text-neutral-100={selectedSource !== "gh-2xnz"}
          on:click={() => { selectedSource = "gh-2xnz"; }}
        >
          gh.2x.nz「推荐-全站反代-By:AcoFork」
        </button>
      </div>
    </div>

    <!-- 原始链接输入 -->
    <div>
      <label for="gh-input" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">原始链接</label>
      <input
        id="gh-input"
        type="text"
        bind:value={inputUrl}
        placeholder="https://github.com/user/repo/releases/download/v1.0/file.zip"
        class="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
      />
    </div>

    <!-- 生成按钮 -->
    <button
      on:click={generate}
      class="w-full px-4 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 active:scale-95 transition-all"
    >
      生成反代链接
    </button>

    <!-- 反代链接输出 -->
    <div>
      <label for="gh-output" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">反代链接</label>
      <input
        id="gh-output"
        type="text"
        readonly
        value={outputUrl}
        placeholder="点击上方「生成反代链接」按钮"
        class="w-full px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button
        on:click={copy}
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        <Icon icon="material-symbols:content-copy" class="text-lg" />
        <span>一键复制</span>
      </button>
      <button
        on:click={download}
        disabled={!outputUrl}
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon icon="material-symbols:download" class="text-lg" />
        <span>一键下载</span>
      </button>
      <button
        on:click={clearAll}
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        <Icon icon="material-symbols:close" class="text-lg" />
        <span>清空</span>
      </button>
    </div>
  </div>
</div>

<!-- Toast -->
{#if toastVisible}
  <div class="fixed top-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl bg-green-500 text-white text-lg font-bold shadow-2xl z-[9999] transition-all">
    {toastMsg}
  </div>
{/if}