import { describe, expect, it } from "vitest";
import { queueItemSourceFile, sourceFileOf } from "@/helpers/sourceFile";
import type { QueueItem } from "@/plugins/api/interfaces";

const subsonic = {
  provider_domain: "opensubsonic",
  provider_instance: "opensubsonic--x",
  item_id: "song_1",
  details: "Musik/Albums/A/01 - Song.mp3",
};
const local = {
  provider_domain: "filesystem_local",
  provider_instance: "filesystem_local--y",
  item_id: "Albums/B/02 - Other.flac",
  details: "checksum-123",
};

function queueItem(mappings: object[]): QueueItem {
  return {
    media_item: { provider_mappings: mappings },
  } as unknown as QueueItem;
}

describe("sourceFileOf", () => {
  it("reads a Subsonic mapping's details and a local file's item id", () => {
    expect(sourceFileOf(subsonic)).toBe("Musik/Albums/A/01 - Song.mp3");
    expect(sourceFileOf(local)).toBe("Albums/B/02 - Other.flac");
  });

  it("knows no file for other providers or a Subsonic mapping without details", () => {
    expect(
      sourceFileOf({ ...subsonic, provider_domain: "spotify" }),
    ).toBeUndefined();
    expect(sourceFileOf({ ...subsonic, details: null })).toBeUndefined();
  });
});

describe("queueItemSourceFile", () => {
  it("takes the mapping the stream was resolved from", () => {
    const item = queueItem([local, subsonic]);
    expect(
      queueItemSourceFile(item, {
        provider: "opensubsonic--x",
        item_id: "song_1",
      }),
    ).toBe("Musik/Albums/A/01 - Song.mp3");
    expect(
      queueItemSourceFile(item, {
        provider: "filesystem_local--y",
        item_id: "Albums/B/02 - Other.flac",
      }),
    ).toBe("Albums/B/02 - Other.flac");
  });

  it("knows no file without a matching mapping or media item", () => {
    expect(
      queueItemSourceFile(queueItem([subsonic]), {
        provider: "opensubsonic--x",
        item_id: "song_2",
      }),
    ).toBeUndefined();
    expect(
      queueItemSourceFile({ media_item: null } as unknown as QueueItem, {
        provider: "opensubsonic--x",
        item_id: "song_1",
      }),
    ).toBeUndefined();
    expect(queueItemSourceFile(undefined, undefined)).toBeUndefined();
  });
});
