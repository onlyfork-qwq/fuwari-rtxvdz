<script lang="ts">
  import Icon from "@iconify/svelte";
  import I18nKey from "../../i18n/i18nKey";
  import { i18n } from "../../i18n/translation";

  interface Props {
    id: string;
    name?: string;
    isCollapsed?: boolean;
    collapsedHeight?: string;
    class?: string;
    style?: string;
  }

  let { id, name, isCollapsed = false, collapsedHeight, style } = $props<Props>();
  let className = $props<string>('');
  let isExpanded = !isCollapsed;

  function expand() {
    isExpanded = true;
  }
</script>

<widget-layout data-id={id} data-is-collapsed={String(!isExpanded)} class={"pb-4 card-base " + className} style={style}>
  <div class="font-bold transition text-lg text-neutral-900 dark:text-neutral-100 relative ml-8 mt-4 mb-2
    before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
    before:absolute before:left-[-16px] before:top-[5.5px]">{name}</div>
  <div id={id} class:list={["collapse-wrapper px-4 overflow-hidden", {"collapsed": !isExpanded}]}>
    <slot></slot>
  </div>
  {!isExpanded && <div class="expand-btn px-4 -mb-2">
    <button class="btn-plain rounded-lg w-full h-9" on:click={expand}>
      <div class="text-[var(--primary)] flex items-center justify-center gap-2 -translate-x-2">
        <Icon icon="material-symbols:more-horiz" class="text-[1.75rem]"></Icon> {i18n(I18nKey.more)}
      </div>
    </button>
  </div>}
</widget-layout>

<style>
  .collapsed {
    height: var(--collapsedHeight);
  }
</style>
