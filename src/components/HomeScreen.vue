<template>
  <div>
    <h2>Página Inicial</h2>
    <transition-group name="list" tag="div">
      <PostItem
        v-for="(post, index) in posts"
        :key="post.user + index"
        :user="post.user"
        :image="post.image"
        :caption="post.caption"
      />
    </transition-group>
  </div>
</template>

<script>
import PostItem from './PostItem.vue'

export default {
  name: 'HomeScreen',
  props: {
    posts: Array
  },
  components: {
    PostItem
  }
}
</script>

<style scoped>
.list-enter-active, .list-leave-active {
  transition: all 0.4s;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>