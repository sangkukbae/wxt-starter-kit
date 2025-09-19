class AnalyticsService {
  private enabled = true;

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  async track(event: string, properties?: Record<string, unknown>): Promise<void> {
    if (!this.enabled) return;
    console.debug('[analytics]', event, properties ?? {});
  }
}

export const analyticsService = new AnalyticsService();
