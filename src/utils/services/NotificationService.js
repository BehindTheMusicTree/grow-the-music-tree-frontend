export default class NotificationService {
  static subscribers = new Set();

  static subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  static showNotification({ type, message, duration = 5000 }) {
    this.subscribers.forEach((callback) => callback({ type, message, duration }));
  }
}
