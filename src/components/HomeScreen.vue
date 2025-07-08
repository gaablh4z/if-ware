<template>
  <div class="home-screen">
    <!-- Stories Ring -->
    <StoriesRing :current-user="currentUser" />
    
    <!-- Feed de Posts -->
    <div class="feed-section">
      <transition-group name="list" tag="div">
        <!-- Posts regulares -->
        <PostItem
          v-for="(post, index) in posts"
          :key="'post-' + post.user + index"
          :post-id="'post_' + index"
          :user="post.user"
          :image="post.image"
          :caption="post.caption"
          :location="post.location"
          :timestamp="post.timestamp || new Date()"
          :enable-reactions="true"
          :initial-comments="post.comments || []"
          @comment-added="handleCommentAdded"
          @post-shared="handlePostShared"
          @post-saved="handlePostSaved"
          @hashtag-clicked="handleHashtagClicked"
        />
        
        <!-- Enquetes -->
        <div 
          v-for="poll in polls" 
          :key="'poll-' + poll.id"
          class="poll-container"
        >
          <PollViewer 
            :poll="poll" 
            :current-user="currentUser"
            @vote="handlePollVote"
            @change-vote="handlePollChangeVote"
          />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import PostItem from './PostItem.vue'
import StoriesRing from './StoriesRing.vue'
import PollViewer from './PollViewer.vue'

export default {
  name: 'HomeScreen',
  props: {
    posts: Array,
    currentUser: {
      type: Object,
      default: () => ({ username: 'você', avatar: null, id: 1 })
    }
  },
  components: {
    PostItem,
    StoriesRing,
    PollViewer
  },
  data() {
    return {
      polls: []
    }
  },
  methods: {
    loadPolls() {
      const savedPolls = localStorage.getItem('if_wave_polls')
      if (savedPolls) {
        this.polls = JSON.parse(savedPolls).filter(poll => 
          new Date(poll.expiresAt) > new Date() || poll.active
        )
      }
    },
    handlePollVote(voteData) {
      const { pollId, optionIndexes, user } = voteData
      const poll = this.polls.find(p => p.id === pollId)
      
      if (poll) {
        // Adiciona voto às opções selecionadas
        optionIndexes.forEach(optionIndex => {
          poll.options[optionIndex].votes++
          if (!poll.settings.anonymous) {
            poll.options[optionIndex].voters.push(user)
          }
        })
        
        // Atualiza total de votos
        poll.totalVotes++
        
        // Salva no localStorage
        this.savePolls()
        
        // Emite evento para real-time
        if (this.$realTime && this.$realTime.isConnected()) {
          this.$realTime.votePoll(pollId, optionIndexes)
        }
      }
    },
    handlePollChangeVote(changeData) {
      const { pollId, user } = changeData
      const poll = this.polls.find(p => p.id === pollId)
      
      if (poll) {
        // Remove votos anteriores do usuário
        poll.options.forEach(option => {
          const voterIndex = option.voters.findIndex(voter => voter.id === user.id)
          if (voterIndex > -1) {
            option.votes--
            option.voters.splice(voterIndex, 1)
          }
        })
        
        poll.totalVotes--
        this.savePolls()
      }
    },
    
    savePolls() {
      localStorage.setItem('if_wave_polls', JSON.stringify(this.polls))
    },

    // Manipula comentário adicionado
    handleCommentAdded(data) {
      const { postId, comment } = data;
      console.log('Comentário adicionado ao post:', postId, comment);
      
      // Emite evento para real-time
      if (this.$realTime && this.$realTime.isConnected()) {
        this.$realTime.emit('comment_added', {
          postId,
          comment,
          timestamp: new Date().toISOString()
        });
      }
    },

    // Manipula compartilhamento de post
    handlePostShared(postId) {
      console.log('Post compartilhado:', postId);
      
      // Estatísticas de compartilhamento
      const shareStats = JSON.parse(localStorage.getItem('shareStats') || '{}');
      shareStats[postId] = (shareStats[postId] || 0) + 1;
      localStorage.setItem('shareStats', JSON.stringify(shareStats));
      
      // Emite evento para real-time
      if (this.$realTime && this.$realTime.isConnected()) {
        this.$realTime.emit('post_shared', {
          postId,
          userId: this.currentUser?.id || 'user1',
          timestamp: new Date().toISOString()
        });
      }
    },

    // Manipula salvamento de post
    handlePostSaved(data) {
      const { postId, saved } = data;
      console.log('Post', saved ? 'salvo' : 'removido dos salvos', ':', postId);
      
      // Emite evento para real-time
      if (this.$realTime && this.$realTime.isConnected()) {
        this.$realTime.emit('post_saved', {
          postId,
          saved,
          userId: this.currentUser?.id || 'user1',
          timestamp: new Date().toISOString()
        });
      }
    },

    // Manipula clique em hashtag
    handleHashtagClicked(hashtag) {
      console.log('Hashtag clicada:', hashtag);
      
      // Emite evento para o componente pai para navegar para busca
      this.$emit('search-hashtag', hashtag);
      
      // Ou navega diretamente se tiver roteamento
      if (this.$router) {
        this.$router.push({
          name: 'Search',
          query: { q: `#${hashtag}` }
        });
      }
    }
  },
  mounted() {
    this.loadPolls()
    
    // Escuta atualizações em tempo real
    if (this.$realTime) {
      this.$realTime.on('pollVote', (data) => {
        // Atualiza poll quando outros usuários votam
        const poll = this.polls.find(p => p.id === data.pollId)
        if (poll) {
          this.loadPolls() // Recarrega para manter sincronizado
        }
      })
    }
  }
}
</script>

<style scoped>
.home-screen {
  width: 100%;
  padding: 0;
}

.feed-section {
  width: 100%;
  margin-top: 0;
}

.poll-container {
  margin-bottom: 20px;
  width: 100%;
}

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

/* Mobile */
@media (max-width: 767px) {
  .home-screen {
    padding: 0;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .home-screen {
    padding: 0 20px;
  }
}

/* Desktop - aproveita toda a largura */
@media (min-width: 1024px) {
  .home-screen {
    padding: 0;
  }
  
  .feed-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

/* Large desktop - layout ainda mais otimizado */
@media (min-width: 1400px) {
  .feed-section {
    gap: 24px;
  }
}
</style>