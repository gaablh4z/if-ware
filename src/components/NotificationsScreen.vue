<template>
  <div class="notifications-container">
    <header class="notifications-header">
      <button class="back-btn" @click="$emit('back')" title="Voltar">
        <span class="back-icon">←</span>
      </button>
      <span class="header-title">Notificações</span>
      <span class="header-icon">🔔</span>
    </header>
    <div class="notifications-list">
      <div
        v-for="(group, date) in groupedNotifications"
        :key="date"
        class="notification-group"
      >
        <div class="group-date">{{ date }}</div>
        <div
          v-for="(notif, idx) in group"
          :key="idx"
          class="notification-item"
          :class="notif.type"
        >
          <span class="notif-icon">{{ getIcon(notif.type) }}</span>
          <div class="notif-content">
            <span class="notif-title">{{ notif.title }}</span>
            <span class="notif-desc">{{ notif.description }}</span>
          </div>
          <span
            v-if="notif.status"
            class="notif-status"
            :class="notif.status"
          >
            {{ notif.status === 'urgente' ? '!' : notif.status === 'positiva' ? '✓' : '' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationsScreen',
  props: {
    notifications: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    groupedNotifications() {
      // Agrupa por data (exemplo simples, pode ser melhorado)
      const groups = {}
      this.notifications.forEach(n => {
        if (!groups[n.date]) groups[n.date] = []
        groups[n.date].push(n)
      })
      // Ordena datas (mais recentes primeiro)
      return Object.fromEntries(
        Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
      )
    }
  },
  methods: {
    getIcon(type) {
      switch (type) {
        case 'mensagem': return '💬'
        case 'interacao': return '👍'
        case 'evento': return '📅'
        case 'anuncio': return '📢'
        case 'solicitacao': return '👥'
        default: return '🔔'
      }
    }
  }
}
</script>

<style scoped>
.notifications-container {
  background: var(--background, #fff);
  color: var(--foreground, #222);
  min-height: 100vh;
  font-family: 'Roboto', 'Open Sans', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}
.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 12px 16px;
  border-bottom: 1px solid var(--border, #dbdbdb);
  background: var(--card, #fff);
}
.back-btn {
  background: none;
  border: none;
  font-size: 1.8em;
  cursor: pointer;
  color: var(--primary, #003D7C);
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.back-btn:hover {
  background: var(--background, #f5f5f5);
}
.back-icon {
  font-weight: bold;
}
.header-icon {
  font-size: 1.5em;
  color: var(--primary, #003D7C);
}
.header-title {
  flex: 1;
  text-align: center;
  font-weight: bold;
  font-size: 1.3em;
  color: var(--primary, #003D7C);
}
.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0 24px 0;
}
.notification-group {
  margin-bottom: 18px;
}
.group-date {
  font-size: 0.95em;
  font-weight: bold;
  color: var(--primary, #003D7C);
  margin: 0 0 8px 18px;
}
.notification-item {
  display: flex;
  align-items: flex-start;
  background: var(--card, #fff);
  border-bottom: 1px solid var(--border, #dbdbdb);
  padding: 10px 16px;
  gap: 10px;
  font-size: 1em;
}
.notification-item:last-child {
  border-bottom: none;
}
.notif-icon {
  font-size: 1.5em;
  margin-top: 2px;
}
.notif-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.notif-title {
  font-weight: bold;
  color: var(--primary, #003D7C);
}
.notif-desc {
  font-size: 0.97em;
  color: var(--foreground, #222);
}
.notif-status {
  font-weight: bold;
  margin-left: 8px;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.95em;
  align-self: center;
}
.notif-status.urgente {
  background: #e74c3c;
  color: #fff;
}
.notif-status.positiva {
  background: var(--verde-energia, #2ECC71);
  color: #fff;
}
.notif-status.info {
  background: var(--accent, #F1C40F);
  color: #222;
}
@media (max-width: 500px) {
  .notifications-container {
    min-height: 100vh;
    padding: 0;
  }
  .notifications-header {
    padding: 14px 8px 10px 8px;
  }
  .back-btn {
    font-size: 1.6em;
    padding: 2px 6px;
  }
  .notification-item {
    padding: 10px 8px;
  }
  .group-date {
    margin-left: 8px;
  }
}
</style>