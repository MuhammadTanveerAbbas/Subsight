type EventName = 
  | 'subscription_added'
  | 'subscription_updated'
  | 'subscription_deleted'
  | 'ai_autofill_used'
  | 'export_json'
  | 'export_csv'
  | 'export_pdf'
  | 'import_data'
  | 'simulation_toggled'
  | 'page_view';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private enabled: boolean = false;

  init() {
    this.enabled = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
  }

  track(event: EventName, properties?: EventProperties) {
    if (!this.enabled) {
      return;
    }

    // Placeholder for actual analytics implementation
    // Replace with: Plausible, Umami, PostHog, etc.
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event, { props: properties });
    }
  }

  page(path: string) {
    this.track('page_view', { path });
  }
}

export const analytics = new Analytics();
