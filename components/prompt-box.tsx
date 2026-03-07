/* eslint-disable @next/next/no-img-element */
"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";

type IconProps = React.SVGProps<SVGSVGElement>;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type PromptTool = {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<IconProps>;
  extra?: string;
};

export interface PromptBoxProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "value" | "defaultValue" | "onChange"
> {
  className?: string;
  textareaClassName?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  onSend?: (payload: {
    message: string;
    image: File | null;
    tool: PromptTool | null;
  }) => void;
  onImageChange?: (file: File | null) => void;
  onVoiceClick?: () => void;
  tools?: PromptTool[];
  maxHeight?: number;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md bg-white px-2 py-1 text-xs text-zinc-900 shadow-md dark:bg-zinc-800 dark:text-zinc-100",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-900 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/2 outline-none",
        className,
      )}
      {...props}
    >
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900">
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-zinc-900 transition-colors hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

DialogContent.displayName = DialogPrimitive.Content.displayName;

function Hint({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </TooltipPrimitive.Root>
  );
}

function IconButton({
  label,
  className,
  type = "button",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Hint label={label}>
      <button
        type={type}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800",
          className,
        )}
        {...props}
      >
        {children}
        <span className="sr-only">{label}</span>
      </button>
    </Hint>
  );
}

const PlusIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <path d="M12 5v14" strokeLinecap="round" />
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <path d="M4 6h10" strokeLinecap="round" />
    <path d="M4 18h10" strokeLinecap="round" />
    <circle cx="17" cy="6" r="3" />
    <circle cx="17" cy="18" r="3" />
  </svg>
);

const SendIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M12 19V5" strokeLinecap="round" />
    <path d="m6 11 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M18 6 6 18" strokeLinecap="round" />
    <path d="m6 6 12 12" strokeLinecap="round" />
  </svg>
);

const GlobeIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" strokeLinecap="round" />
    <path d="M12 3c2.5 2.5 4 5.8 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.8-4-9s1.5-6.5 4-9Z" />
  </svg>
);

const PencilIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <path
      d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"
      strokeLinejoin="round"
    />
    <path d="m13.5 6.5 4 4" strokeLinecap="round" />
  </svg>
);

const BrushIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <path d="m14 4 6 6" strokeLinecap="round" />
    <path
      d="M3 21h6a5 5 0 0 0 3.5-1.5L20 12l-6-6-7.5 7.5A5 5 0 0 0 5 17v1a3 3 0 0 1-2 3Z"
      strokeLinejoin="round"
    />
  </svg>
);

const TelescopeIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <path d="m4 7 10-4 3 7-10 4Z" strokeLinejoin="round" />
    <path d="m9 13-2 8" strokeLinecap="round" />
    <path d="m13 12 2 9" strokeLinecap="round" />
    <path d="m17 5 3 7" strokeLinecap="round" />
    <path d="M6 21h10" strokeLinecap="round" />
  </svg>
);

const LightbulbIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <path
      d="M12 3a7 7 0 0 0-4.2 12.6c.8.6 1.4 1.5 1.6 2.4h5.2c.2-.9.8-1.8 1.6-2.4A7 7 0 0 0 12 3Z"
      strokeLinejoin="round"
    />
    <path d="M9 18h6" strokeLinecap="round" />
    <path d="M10 21h4" strokeLinecap="round" />
  </svg>
);

const MicIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    {...props}
  >
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M19 11v1a7 7 0 0 1-14 0v-1" strokeLinecap="round" />
    <path d="M12 19v4" strokeLinecap="round" />
    <path d="M8 23h8" strokeLinecap="round" />
  </svg>
);

export const defaultTools: PromptTool[] = [
  {
    id: "createImage",
    name: "Create an image",
    shortName: "Image",
    icon: BrushIcon,
  },
  {
    id: "searchWeb",
    name: "Search the web",
    shortName: "Search",
    icon: GlobeIcon,
  },
  {
    id: "writeCode",
    name: "Write or code",
    shortName: "Write",
    icon: PencilIcon,
  },
  {
    id: "deepResearch",
    name: "Run deep research",
    shortName: "Deep Search",
    icon: TelescopeIcon,
    extra: "5 left",
  },
  {
    id: "thinkLonger",
    name: "Think for longer",
    shortName: "Think",
    icon: LightbulbIcon,
  },
];

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  (
    {
      className,
      textareaClassName,
      value: valueProp,
      defaultValue = "",
      placeholder = "Message...",
      onChange,
      onValueChange,
      onSend,
      onImageChange,
      onVoiceClick,
      onKeyDown,
      tools = defaultTools,
      maxHeight = 200,
      disabled,
      ...textareaProps
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [selectedToolId, setSelectedToolId] = React.useState<string | null>(
      null,
    );
    const [isToolsOpen, setIsToolsOpen] = React.useState(false);
    const [isImageOpen, setIsImageOpen] = React.useState(false);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);

    const value = isControlled ? valueProp : internalValue;
    const activeTool = tools.find((tool) => tool.id === selectedToolId) ?? null;
    const ActiveToolIcon = activeTool?.icon;
    const canSend = value.trim().length > 0 || !!imageFile;

    React.useImperativeHandle(
      ref,
      () => textareaRef.current as HTMLTextAreaElement,
    );

    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight]);

    React.useEffect(() => {
      if (!imageFile) {
        setImagePreview(null);
        return;
      }

      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);

      return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const setValue = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    };

    const clearImage = () => {
      setImageFile(null);
      setIsImageOpen(false);
      onImageChange?.(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleTextareaChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setValue(event.target.value);
      onChange?.(event);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file || !file.type.startsWith("image/")) {
        event.target.value = "";
        return;
      }

      setImageFile(file);
      onImageChange?.(file);
      event.target.value = "";
    };

    const handleSend = () => {
      if (!onSend || !canSend) return;

      onSend({
        message: value,
        image: imageFile,
        tool: activeTool,
      });

      setValue("");
      clearImage();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || !onSend) return;

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    };

    return (
      <TooltipPrimitive.Provider delayDuration={100}>
        <div
          className={cn(
            "flex flex-col rounded-[28px] border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
            className,
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />

          {imagePreview && (
            <>
              <div className="mb-2 w-fit">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsImageOpen(true)}
                    className="overflow-hidden rounded-2xl"
                    disabled={disabled}
                  >
                    <img
                      src={imagePreview}
                      alt="Selected image preview"
                      className="h-14 w-14 object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100 dark:bg-zinc-900/90 dark:text-white dark:hover:bg-zinc-800"
                    aria-label="Remove image"
                    disabled={disabled}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <DialogPrimitive.Root
                open={isImageOpen}
                onOpenChange={setIsImageOpen}
              >
                <DialogContent>
                  <img
                    src={imagePreview}
                    alt="Selected image"
                    className="max-h-[90vh] w-full object-contain"
                  />
                </DialogContent>
              </DialogPrimitive.Root>
            </>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-12 w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-zinc-500",
              textareaClassName,
            )}
            {...textareaProps}
          />

          <div className="flex items-center gap-2 px-1 pb-1">
            <IconButton
              label="Attach image"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <PlusIcon className="h-5 w-5" />
            </IconButton>

            <PopoverPrimitive.Root
              open={isToolsOpen}
              onOpenChange={setIsToolsOpen}
            >
              <Hint label="Tools">
                <PopoverPrimitive.Trigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className="flex h-8 items-center gap-2 rounded-full px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    {!activeTool && <span>Tools</span>}
                  </button>
                </PopoverPrimitive.Trigger>
              </Hint>

              <PopoverContent side="top" align="start">
                <div className="flex flex-col gap-1">
                  {tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    const selected = tool.id === selectedToolId;

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setSelectedToolId(tool.id);
                          setIsToolsOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          selected && "bg-zinc-100 dark:bg-zinc-800",
                        )}
                      >
                        <ToolIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{tool.name}</span>
                        {tool.extra && (
                          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
                            {tool.extra}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </PopoverPrimitive.Root>

            {activeTool && (
              <button
                type="button"
                onClick={() => setSelectedToolId(null)}
                className="flex h-8 items-center gap-2 rounded-full bg-sky-50 px-3 text-sm text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50"
              >
                {ActiveToolIcon && <ActiveToolIcon className="h-4 w-4" />}
                <span>{activeTool.shortName}</span>
                <XIcon className="h-4 w-4" />
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <IconButton
                label="Record voice"
                onClick={onVoiceClick}
                disabled={disabled}
              >
                <MicIcon className="h-5 w-5" />
              </IconButton>

              <Hint label="Send">
                <button
                  type={onSend ? "button" : "submit"}
                  onClick={onSend ? handleSend : undefined}
                  disabled={disabled || !canSend}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <SendIcon className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </button>
              </Hint>
            </div>
          </div>
        </div>
      </TooltipPrimitive.Provider>
    );
  },
);

PromptBox.displayName = "PromptBox";

export default PromptBox;
