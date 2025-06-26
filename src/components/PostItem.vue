<template>
  <div class="post">
    <div class="post-header">
      <span class="avatar">{{ user.charAt(0).toUpperCase() }}</span>
      <span class="username">{{ user }}</span>
    </div>
    <img :src="image" class="post-image" />
    <div class="post-caption">
      <span class="username">{{ user }}</span>
      <span>{{ caption }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostItem',
  props: {
    user: String,
    image: String,
    caption: String
  }
}
</script>

<style scoped>
.post {
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  margin-bottom: 24px;
  background: #fff;
  box-sizing: border-box;
}
.post-header {
  display: flex;
  align-items: center;
  padding: 8px;
}
.avatar {
  width: 32px;
  height: 32px;
  background: #bbb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  margin-right: 8px;
}
.username {
  font-weight: bold;
  color: #262626;
}
.post-image {
  width: 100%;
  display: block;
  margin: 0;
  max-height: 350px;
  object-fit: cover;
}
.post-caption {
  padding: 8px;
  font-size: 0.95em;
  word-break: break-word;
}
@media (max-width: 500px) {
  .post {
    border-radius: 0;
    margin-bottom: 16px;
  }
  .post-image {
    max-height: 220px;
  }
  .post-caption {
    padding: 6px;
    font-size: 0.93em;
  }
}
</style>