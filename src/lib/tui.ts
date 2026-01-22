import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function promptMode(): Promise<"inline" | "reference"> {
  const rl = createInterface({ input, output });
  try {
    while (true) {
      const answer = await rl.question(
        "Select output mode: (1) inline, (2) reference > ",
      );
      const trimmed = answer.trim();
      if (trimmed === "1" || trimmed.toLowerCase() === "inline") {
        return "inline";
      }
      if (trimmed === "2" || trimmed.toLowerCase() === "reference") {
        return "reference";
      }
    }
  } finally {
    rl.close();
  }
}
