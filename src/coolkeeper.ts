type ReportResult = { jobId: string } | { skipped: true; reason: string; prUrl?: string } | null;

interface CoolKeeperOptions {
  publicKey: string;
  appId: string;
  url: string;
  repoUrl: string;
  branch: string;
}

export class CoolKeeper {
  private publicKey: string;
  private appId: string;
  private url: string;
  private repoUrl: string;
  private branch: string;

  constructor(opts: CoolKeeperOptions) {
    this.publicKey = opts.publicKey;
    this.appId = opts.appId;
    this.url = opts.url.replace(/\/$/, "");
    this.repoUrl = opts.repoUrl;
    this.branch = opts.branch;
  }

  async report(error: Error | string, context?: Record<string, unknown>): Promise<ReportResult> {
    try {
      const errorMessage = typeof error === "string" ? error : error.message;
      const stack = typeof error === "string" ? undefined : error.stack;

      const body = JSON.stringify({
        error: errorMessage,
        stack,
        repoUrl: this.repoUrl,
        branch: this.branch,
        context,
      });

      console.log({ body })

      const res = await fetch(`${this.url}/api/errors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-public-key": this.publicKey,
          "x-app-id": this.appId,
        },
        body,
      });

      if (!res.ok) {
        console.warn(`[cool-keeper] Error reporting failed: ${res.status} ${res.statusText}`);
        return null;
      }

      console.log({ resStatus: res.status })

      return await res.json();
    } catch (err) {
      console.warn("[cool-keeper] Failed to report error:", err);
      return null;
    }
  }
}

export const coolKeeper = new CoolKeeper({
  url: "https://cool-keeper.sacadalabs.com",
  appId: "setup-my-mac",
  publicKey: "91e145ba4a27f823dccda2bd46ea968b03a0ee4cb36df49f53e98e6474c44403",
  repoUrl: "https://github.com/claudiobusatto/demo-app-with-errors",
  branch: "main",
});
