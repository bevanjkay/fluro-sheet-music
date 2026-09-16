<template>
  <div class="float-label">
    <slot />
  </div>
</template>

<style scoped>
.float-label {
  position: relative;
  display: block;
}

/* The control renders before its label, so sibling combinators can drive the
   float state without :has(), which Safari 14 does not support. */
.float-label :deep(label) {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  transform-origin: left top;
  color: rgb(113 113 122);
  font-size: 0.875rem;
  pointer-events: none;
  transition: top 0.15s ease, font-size 0.15s ease, transform 0.15s ease;
}

.float-label :deep(input:focus ~ label),
.float-label :deep(input:not(:placeholder-shown) ~ label) {
  top: 0.35rem;
  font-size: 0.7rem;
  transform: none;
}

.float-label :deep(input) {
  padding-top: 1.4rem;
  padding-bottom: 0.45rem;
}
</style>
