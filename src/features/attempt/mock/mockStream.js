export class MockEventSource {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onerror = null;
    this.timer = null;
    this.remaining = 10800; // 3 hours

    // Simulate connection delay
    setTimeout(() => {
      this.startStream();
    }, 500);
  }

  startStream() {
    this.timer = setInterval(() => {
      this.remaining -= 1;
      if (this.onmessage) {
        this.onmessage({
          data: JSON.stringify({ remainingSeconds: this.remaining })
        });
      }
      if (this.remaining <= 0) {
        this.close();
      }
    }, 1000);
  }

  close() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
