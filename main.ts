// One Word From Grandma — entry builder
//
// Grandma has heard about the AI. She is not opening an app,
// she is not reading a press release, she is texting the family
// group chat about it, from memory, with her glasses half on.
//
// She means ChatGPT. What her thumbs produce is this:

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORD = "ChatGTP";

// She would never send two words when one (almost-right) one will do.
// Guard the whole point of the entry: a single token, no spaces,
// no surrounding whitespace sneaking in from an edit.
function checkOneWord(candidate: string): void {
  if (candidate.length === 0) {
    throw new Error("entry word is empty");
  }
  if (candidate.trim() !== candidate) {
    throw new Error("entry word has leading or trailing whitespace");
  }
  if (/\s/.test(candidate)) {
    throw new Error("entry word must be exactly one word, with no spaces");
  }
  const parts = candidate.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length !== 1) {
    throw new Error(`expected exactly 1 word, found ${parts.length}`);
  }
}

// Checking the constant before writing is only half the promise.
// What gets judged is the file on disk, so read that file back and
// hold it to exactly the same standard: it must be the word itself,
// byte for byte, with nothing extra riding along — no trailing
// newline, no second word, no silent truncation from the write.
function verifyWrittenEntry(entryPath: string): void {
  const onDisk = readFileSync(entryPath, "utf-8");
  if (onDisk !== WORD) {
    throw new Error(
      `entry.txt does not match the intended word: ${JSON.stringify(onDisk)}`,
    );
  }
  checkOneWord(onDisk);
}

function main(): void {
  checkOneWord(WORD);

  const outDir = process.env.OUTPUT_DIR ?? "/output";

  // Create the output directory if it is missing. Only ever create
  // it here — never remove it: on the grading runner it may be a
  // mounted volume, and deleting a mount point breaks the run.
  mkdirSync(outDir, { recursive: true });

  const entryPath = join(outDir, "entry.txt");
  writeFileSync(entryPath, WORD, "utf-8");
  verifyWrittenEntry(entryPath);

  console.log(`wrote ${entryPath}: ${WORD}`);
}

main();
