import App from "./App";
import Signals = NodeJS.Signals;
import { formatError, getLogger } from "./utils/Logging";
import { checkEnv } from "./utils/Helpers";

export default class Server {
  private logger = getLogger();
  private app: App;

  constructor() {
    checkEnv();
    this.app = new App();
  }

  stop = async (): Promise<void> => {
    await this.app.stop();
  };

  start = async (): Promise<void> => {
    try {
      await this.app.start();
      this.logger.info("Add signal handlers");
      const signals: Array<Signals> = ["SIGINT", "SIGTERM"];

      signals.forEach((signal: Signals) => {
        process.on(signal, async () => {
          this.logger.debug("Process is being terminated!");
          await this.stop();
        });
      });
    } catch (err) {
      this.logger.error(`Server could not be started ${formatError(err)}`);
      await this.stop();
    }
  };
}
