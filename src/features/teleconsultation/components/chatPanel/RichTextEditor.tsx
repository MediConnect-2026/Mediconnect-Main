import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useCallback } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  isMobile?: boolean;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
  title,
  isMobile,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      `${isMobile ? "p-1.5" : "p-2"} rounded-md transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed`,
      isActive && "bg-accent text-accent-foreground",
    )}
  >
    {children}
  </button>
);

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  if (!editor) return null;

  const iconSize = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn(
        "flex items-center border-b border-primary/40 space-x-0.5 md:space-x-1 bg-background/50",
        isMobile ? "p-1.5 overflow-x-auto" : "p-2",
      )}
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title={t("richText.bold")}
        isMobile={isMobile}
      >
        <Bold className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title={t("richText.italic")}
        isMobile={isMobile}
      >
        <Italic className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title={t("richText.underline")}
        isMobile={isMobile}
      >
        <UnderlineIcon className={iconSize} />
      </ToolbarButton>

      <div
        className={cn("w-px bg-border", isMobile ? "h-5 mx-0.5" : "h-6 mx-1")}
      />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title={t("richText.heading")}
        isMobile={isMobile}
      >
        <Heading2 className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title={t("richText.bulletList")}
        isMobile={isMobile}
      >
        <List className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title={t("richText.orderedList")}
        isMobile={isMobile}
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>

      <div
        className={cn("w-px bg-border", isMobile ? "h-5 mx-0.5" : "h-6 mx-1")}
      />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title={t("richText.undo")}
        isMobile={isMobile}
      >
        <Undo className={iconSize} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title={t("richText.redo")}
        isMobile={isMobile}
      >
        <Redo className={iconSize} />
      </ToolbarButton>
    </div>
  );
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  label?: string;
  minHeight?: string; // 👈 nueva prop
  maxHeight?: string; // 👈 nueva prop
  disabled?: boolean;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Enter your text here...",
  error,
  className,
  label,
  minHeight, // 👈
  maxHeight, // 👈
  disabled = false,
}: RichTextEditorProps) => {
  const isMobile = useIsMobile();

  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    [onChange],
  );

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none",
          isMobile ? "min-h-[100px] text-sm" : "min-h-[120px]",
        ),
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Sync disabled state
  useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex flex-row justify-between items-center mb-2 gap-2">
          <label className="text-left text-sm md:text-base lg:text-lg text-primary">
            {label}
          </label>
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-3xl border border-primary/50 bg-background transition-all focus-within:border-primary",
          error ? "border-destructive" : "border-primary/50",
        )}
        style={{
          // Usa la prop si se pasa, si no el valor por defecto según dispositivo
          maxHeight: maxHeight ?? (isMobile ? "200px" : "250px"),
          minHeight: minHeight ?? (isMobile ? "150px" : "180px"),
          overflowY: "auto",
        }}
      >
        <EditorToolbar editor={editor} />
        <div className={cn("tiptap-editor", isMobile ? "p-2" : "p-3")}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {error && <p className="form-error text-xs md:text-sm">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
