<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')

          if (entry.target.classList.contains('last-text')) {
            setTimeout(() => {
              window.scrollTo({ top: 0 }) // ✅ 跳轉前先滾回頂部
              router.push('/home')
            }, 1500)
          }
        }
      })
    },
    {
      threshold: 0.5,
    }
  )

  document.querySelectorAll('.text-section').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<template>
  <div class="intro-container">
    <div class="background"></div>
    <div class="overlay"></div>
    <div class="content">
      <section class="text-section">
        <p>在世界的一角，</p>
        <p>有一間只在深夜現身的麵鋪——</p>
      </section>

      <section class="text-section">
        <p>他們不賣固定菜單，</p>
        <p>只提供一樣東西：<strong>打造你自己的命運泡麵。</strong></p>
      </section>

      <section class="text-section">
        <p>滾燙的湯底、神祕的配料、甚至古怪的驚喜……</p>
        <p>都由你親手決定。</p>
      </section>

      <section class="text-section">
        <p>是要滿滿肉肉？還是創意爆表的貓薄荷口味？</p>
        <p>命運，只等你一指翻轉。</p>
      </section>

      <section class="text-section last-text">
        <p>🧙‍♂️ <strong>來吧，泡麵預言師。</strong></p>
        <p>滑動到底，揭開屬於你的泡麵冒險……</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.intro-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: white;
  font-family: "Noto Sans TC", sans-serif;
}

.background {
  position: fixed;
  inset: 0;
  background-image: url('/opensky.png');
  background-size: cover;
  background-position: center;
  z-index: -2;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4); /* 星空加深，讓文字更清楚 */
  z-index: -1;
}

.content {
  position: relative;
  z-index: 1;
  padding: 10vh 10vw;
  display: flex;
  flex-direction: column;
  gap: 500px;
}

.text-section {
  opacity: 0;
  transform: translateY(50px);
  transition: all 1.2s ease;
  font-size: 1.5rem;
  line-height: 1.8;
  will-change: opacity, transform;
}

.text-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.text-section p {
  margin: 0.3rem 0;
  text-align: center;
}

strong {
  color: #ffd700;
}

/* 手機響應式 */
@media (max-width: 768px) {
  .content {
    padding: 8vh 6vw;
    gap: 300px;
  }

  .text-section {
    font-size: 1.2rem;
  }
}
</style>