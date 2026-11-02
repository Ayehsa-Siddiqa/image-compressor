"use client";

import { useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { uploadImageFile } from "./upload-image";

interface RichTextEditorProps {
  /** Form field the HTML is submitted as. */
  name: string;
  initialHtml: string;
  error?: string;
}

/** WYSIWYG article editor. The HTML is cleaned on the server when the post is saved. */
export function RichTextEditor({ name, initialHtml, error }: RichTextEditorProps) {
  const [html, setHtml] = useState(initialHtml);
  const editor = useEditor({
    // Rendered on the client only; the server sends the empty frame.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    content: initialHtml,
    editorProps: { attributes: { class: "article-content article-editor min-h-[420px] px-5 py-4 focus:outline-none", "aria-label": "Article" } },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className={`overflow-hidden rounded-[6px] border bg-card focus-within:border-primary ${error ? "border-danger" : "border-line-strong"}`}>
      <input type="hidden" name={name} value={html} />
      {editor ? <Toolbar editor={editor} /> : <div className="h-[46px] border-b border-line bg-surface" />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const imageInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      paragraph: editor.isActive("paragraph"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      link: editor.isActive("link"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  function editLink() {
    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (e.g. https://example.com or /blogs/some-post). Leave empty to remove the link.", current ?? "");
    if (url === null) return;
    if (!url.trim()) {
      chain().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (editor.state.selection.empty && !current) {
      chain().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run();
    } else {
      chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }
  }

  async function insertImage(file: File) {
    setUploadError(undefined);
    setUploading(true);
    const { image, error } = await uploadImageFile(file);
    setUploading(false);
    if (!image) {
      setUploadError(error);
      return;
    }
    const alt = window.prompt("Describe the image (alt text, for accessibility and SEO):", "") ?? "";
    chain().setImage({ src: image.src, alt, width: image.width, height: image.height } as { src: string; alt: string }).run();
  }

  return (
    <div className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1.5" role="toolbar" aria-label="Formatting">
        <Tool label="Paragraph" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
          <Pilcrow />
        </Tool>
        <Tool label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Tool>
        <Tool label="Sub-heading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 />
        </Tool>
        <Divider />
        <Tool label="Bold (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold />
        </Tool>
        <Tool label="Italic (Ctrl+I)" active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic />
        </Tool>
        <Tool label="Underline (Ctrl+U)" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline />
        </Tool>
        <Tool label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}>
          <Strikethrough />
        </Tool>
        <Tool label="Link" active={state.link} onClick={editLink}>
          <Link2 />
        </Tool>
        <Divider />
        <Tool label="Bulleted list" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
          <List />
        </Tool>
        <Tool label="Numbered list" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered />
        </Tool>
        <Tool label="Quote" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote />
        </Tool>
        <Tool label="Divider line" onClick={() => chain().setHorizontalRule().run()}>
          <Minus />
        </Tool>
        <Tool label="Insert image" disabled={uploading} onClick={() => imageInput.current?.click()}>
          {uploading ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
        </Tool>
        <Divider />
        <Tool label="Undo (Ctrl+Z)" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 />
        </Tool>
        <Tool label="Redo (Ctrl+Shift+Z)" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 />
        </Tool>
      </div>
      {uploadError && <p className="border-t border-line px-3 py-1.5 text-xs text-danger">{uploadError}</p>}
      <input
        ref={imageInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void insertImage(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor's selection when clicking a toolbar button.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-[5px] transition-colors disabled:opacity-35 [&_svg]:size-4 ${
        active ? "bg-primary-soft text-accent" : "text-body hover:bg-card hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-line-strong" aria-hidden />;
