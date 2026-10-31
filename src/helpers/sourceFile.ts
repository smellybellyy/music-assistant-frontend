import type {
  ProviderMapping,
  QueueItem,
  StreamDetails,
} from "@/plugins/api/interfaces";

/**
 * The file a provider mapping plays from, where the provider tells: local files
 * use their path as the item id, and a Subsonic server reports it as the
 * mapping's details (Navidrome only with "Report Real Path" on for the client,
 * else a made-up artist/album/title path).
 */
export function sourceFileOf(
  mapping: Pick<ProviderMapping, "provider_domain" | "item_id" | "details">,
): string | undefined {
  if (mapping.provider_domain.startsWith("filesystem")) return mapping.item_id;
  if (mapping.provider_domain === "opensubsonic")
    return mapping.details ?? undefined;
  return undefined;
}

/**
 * The file the queue item's stream is playing from: the media item's mapping
 * the stream was resolved from (track linking may pick any of them).
 */
export function queueItemSourceFile(
  queueItem: QueueItem | undefined,
  streamDetails: Pick<StreamDetails, "provider" | "item_id"> | undefined,
): string | undefined {
  const mediaItem = queueItem?.media_item;
  if (!mediaItem || !streamDetails || !("provider_mappings" in mediaItem))
    return undefined;
  const mapping = mediaItem.provider_mappings.find(
    (m) =>
      m.provider_instance === streamDetails.provider &&
      m.item_id === streamDetails.item_id,
  );
  return mapping ? sourceFileOf(mapping) : undefined;
}
