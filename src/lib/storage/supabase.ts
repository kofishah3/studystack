import {
  getSupabaseServiceClient,
  SUPABASE_STORAGE_BUCKET,
} from "@/lib/supabase";
import {
  DEFAULT_URL_TTL_SECONDS,
  type StorageDriver,
} from "@/lib/storage";

function bucket() {
  return getSupabaseServiceClient().storage.from(SUPABASE_STORAGE_BUCKET);
}

export const supabaseStorage: StorageDriver = {
  async put({ key, buffer, mimeType }) {
    const { error } = await bucket().upload(key, buffer, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) throw new Error(`supabase upload failed: ${error.message}`);
    return key;
  },

  async putStream({ key, stream, mimeType, contentLength }) {
    const { error } = await bucket().upload(
      key,
      stream as unknown as Blob,
      {
        contentType: mimeType,
        upsert: false,
        ...(contentLength !== undefined ? { duplex: "half" } : {}),
      } as Parameters<ReturnType<typeof bucket>["upload"]>[2],
    );
    if (error) throw new Error(`supabase upload failed: ${error.message}`);
    return key;
  },

  async getUrl(key, opts) {
    const expiresIn = opts?.expiresIn ?? DEFAULT_URL_TTL_SECONDS;
    const { data, error } = await bucket().createSignedUrl(key, expiresIn);
    if (error || !data?.signedUrl) {
      throw new Error(
        `supabase signed url failed: ${error?.message ?? "no url returned"}`,
      );
    }
    return data.signedUrl;
  },

  async delete(key) {
    const { error } = await bucket().remove([key]);
    if (error && !/not.*found/i.test(error.message)) {
      throw new Error(`supabase delete failed: ${error.message}`);
    }
  },
};
