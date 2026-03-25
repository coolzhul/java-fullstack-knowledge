<template>
  <ClientOnly>
    <div
      class="ai-disclaimer"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @mousedown="startDrag"
    >
      ⚠️ 内容由AI创作，请谨慎甄别
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const offset = ref({ x: 0, y: 0 });

const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  offset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };
  e.preventDefault();
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;

  let newX = e.clientX - offset.value.x;
  let newY = e.clientY - offset.value.y;

  // 边界限制
  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 50;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  position.value = { x: newX, y: newY };
};

const stopDrag = () => {
  isDragging.value = false;
};

onMounted(() => {
  // 初始化位置
  position.value = {
    x: window.innerWidth - 250,
    y: window.innerHeight - 60,
  };

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped>
.ai-disclaimer {
  position: fixed;
  background: rgba(231, 76, 60, 0.9);
  color: #fff;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  cursor: move;
  user-select: none;
  transition: box-shadow 0.3s ease;
}

.ai-disclaimer:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}
</style>
