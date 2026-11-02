import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "New post" };

// Sign-in is checked by the (panel) layout and again by every save.
export default function NewPostPage() {
  return <PostEditor />;
}
