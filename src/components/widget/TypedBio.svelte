<script lang="ts">
  import { onMount } from "svelte";

  export let filePath: string;

  let displayText = "";
  let lines: string[] = [];
  let currentLine = "";
  let charIndex = 0;
  let cursorVisible = true;
  let timer: ReturnType<typeof setTimeout>;
  let cursorInterval: ReturnType<typeof setInterval>;

  const TYPE_SPEED = 100;
  const DELETE_SPEED = 50;
  const PAUSE_BEFORE_DELETE = 2200;
  const PAUSE_BEFORE_TYPE = 400;

  async function loadLines() {
    try {
      const resp = await fetch(filePath);
      const text = await resp.text();
      lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        pickNext();
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        console.error("Failed to load bio file:", e);
      }
    }
  }

  function pickNext() {
    const idx = Math.floor(Math.random() * lines.length);
    currentLine = lines[idx];
    charIndex = 0;
    typeChar();
  }

  function typeChar() {
    if (charIndex <= currentLine.length) {
      displayText = currentLine.slice(0, charIndex);
      charIndex++;
      // 使用requestAnimationFrame代替setTimeout，避免阻塞主线程
      timer = setTimeout(() => {
        // 在下一个事件循环中执行，给其他组件留出执行时间
        requestAnimationFrame(typeChar);
      }, TYPE_SPEED);
    } else {
      timer = setTimeout(deleteChar, PAUSE_BEFORE_DELETE);
    }
  }

  function deleteChar() {
    if (charIndex > 0) {
      charIndex--;
      displayText = currentLine.slice(0, charIndex);
      // 使用requestAnimationFrame代替setTimeout，避免阻塞主线程
      timer = setTimeout(() => {
        // 在下一个事件循环中执行，给其他组件留出执行时间
        requestAnimationFrame(deleteChar);
      }, DELETE_SPEED);
    } else {
      timer = setTimeout(pickNext, PAUSE_BEFORE_TYPE);
    }
  }

  onMount(() => {
    // 优化光标闪烁效果，减少DOM更新
    cursorInterval = setInterval(() => {
      cursorVisible = !cursorVisible;
    }, 530);
    loadLines();
    return () => {
      clearInterval(cursorInterval);
      clearTimeout(timer);
    };
  });
</script>

<span class="text-neutral-400">{displayText}</span><span
  class="text-neutral-400"
  class:opacity-0={!cursorVisible}
>|</span
>
