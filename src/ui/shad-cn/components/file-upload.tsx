"use client";

import { ark } from "@ark-ui/react/factory";
import {
  FileUpload as ArkFileUpload,
  useFileUploadContext as useArkFileUploadContext,
} from "@ark-ui/react/file-upload";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import type React from "react";
import { cn } from "@ui/lib/utils";
import { Button } from "@ui/shad-cn/components/button";

export const useFileUpload = useArkFileUploadContext;

export const FileUpload = (
  props: React.ComponentProps<typeof ArkFileUpload.Root>
) => {
  const { className, children, ...rest } = props;

  return (
    <ArkFileUpload.Root
      className={cn(
        "group/file-upload relative flex flex-col gap-3",
        className
      )}
      data-slot="file-upload"
      {...rest}
    >
      {children}

      <ArkFileUpload.HiddenInput />
    </ArkFileUpload.Root>
  );
};

export const FileUploadTrigger = (
  props: React.ComponentProps<typeof ArkFileUpload.Trigger>
) => <ArkFileUpload.Trigger data-slot="file-upload-trigger" {...props} />;

export const FileUploadDropzone = (
  props: React.ComponentProps<typeof ArkFileUpload.Dropzone>
) => {
  const { className, ...rest } = props;

  return (
    <ArkFileUpload.Dropzone
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 px-6 py-8 text-center",
        "rounded-lg border border-input border-dashed bg-transparent",
        "hover:bg-accent/50 dark:hover:bg-input/10",
        "data-cover:absolute data-cover:inset-0 data-cover:flex data-cover:items-center data-cover:justify-center",
        "data-dragging:border-primary data-dragging:bg-primary/5",
        "data-invalid:border-destructive",
        className
      )}
      data-slot="file-upload-dropzone"
      {...rest}
    />
  );
};

export const FileUploadDropzoneIcon = (
  props: React.ComponentProps<typeof ark.div>
) => {
  const { className, children, ...rest } = props;

  return (
    <ark.div
      className={cn(
        "flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground",
        "group-data-dragging/file-upload:bg-primary/10 group-data-dragging/file-upload:text-primary",
        "[&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="file-upload-dropzone-icon"
      {...rest}
    >
      {children || <UploadIcon />}
    </ark.div>
  );
};

export const FileUploadTitle = (
  props: React.ComponentProps<typeof ark.div>
) => {
  const { className, ...rest } = props;

  return (
    <ark.div
      className={cn("font-medium text-foreground text-sm", className)}
      data-slot="file-upload-title"
      {...rest}
    />
  );
};

export const FileUploadDescription = (
  props: React.ComponentProps<typeof ark.div>
) => {
  const { className, ...rest } = props;

  return (
    <ark.div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="file-upload-description"
      {...rest}
    />
  );
};

export const FileUploadHelper = (
  props: React.ComponentProps<typeof ark.div>
) => {
  const { className, ...rest } = props;

  return (
    <ark.div
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="file-upload-dropzone-helper"
      {...rest}
    />
  );
};

export const FileUploadItemGroup = (
  props: React.ComponentProps<typeof ArkFileUpload.ItemGroup>
) => <ArkFileUpload.ItemGroup data-slot="file-upload-item-group" {...props} />;

interface FileUploadListProps
  extends Omit<React.ComponentProps<typeof ArkFileUpload.Item>, "file"> {}

export const FileUploadList = (props: FileUploadListProps) => {
  const { className, ...rest } = props;

  const fileUpload = useFileUpload();

  const files = fileUpload.acceptedFiles;

  if (files.length === 0) {
    return null;
  }

  return (
    <FileUploadItemGroup className="flex flex-col gap-2">
      {files.map((file, index) => {
        const isImage = file.type.startsWith("image/");

        const key = `${file.name}-${index}`;

        return (
          <FileUploadItem
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border bg-card p-2",
              className
            )}
            file={file}
            key={key}
            {...rest}
          >
            <FileUploadItemPreview
              className="size-8"
              {...(isImage ? { type: "image/*" } : { type: ".*" })}
            >
              {isImage ? (
                <FileUploadItemPreviewImage />
              ) : (
                <FileIcon aria-hidden="true" className="size-4" />
              )}
            </FileUploadItemPreview>

            <div className="min-w-0 flex-1 overflow-hidden">
              <FileUploadItemName />
              <FileUploadItemSize />
            </div>

            <FileUploadItemDeleteTrigger asChild>
              <Button
                aria-label="Remove file"
                className="hover:bg-destructive/10 hover:text-destructive"
                size="icon-sm"
                variant="ghost"
              >
                <XIcon aria-hidden="true" />
              </Button>
            </FileUploadItemDeleteTrigger>
          </FileUploadItem>
        );
      })}
    </FileUploadItemGroup>
  );
};

export const FileUploadItem = (
  props: React.ComponentProps<typeof ArkFileUpload.Item>
) => {
  const { className, ...rest } = props;

  return (
    <ArkFileUpload.Item
      className={cn("relative inline-flex", className)}
      data-slot="file-upload-item"
      {...rest}
    />
  );
};

export const FileUploadItemPreview = (
  props: React.ComponentProps<typeof ArkFileUpload.ItemPreview>
) => {
  const { className, ...rest } = props;

  return (
    <ArkFileUpload.ItemPreview
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground",
        "[&_svg]:size-4",
        className
      )}
      data-slot="file-upload-item-preview"
      {...rest}
    />
  );
};

export const FileUploadItemPreviewImage = (
  props: React.ComponentProps<typeof ArkFileUpload.ItemPreviewImage>
) => {
  const { className, ...rest } = props;

  return (
    <ArkFileUpload.ItemPreviewImage
      className={cn(
        "aspect-square size-full rounded-[inherit] object-cover",
        className
      )}
      data-slot="file-upload-item-preview-image"
      {...rest}
    />
  );
};

export const FileUploadItemName = (
  props: React.ComponentProps<typeof ArkFileUpload.ItemName>
) => {
  const { className, ...rest } = props;

  return (
    <ArkFileUpload.ItemName
      className={cn(
        "truncate font-medium text-sm",
        "min-w-0",
        "overflow-hidden",
        className
      )}
      data-slot="file-upload-item-name"
      {...rest}
    />
  );
};

export const FileUploadItemSize = (
  props: React.ComponentProps<typeof ArkFileUpload.ItemSizeText>
) => {
  const { className, ...rest } = props;

  return (
    <ArkFileUpload.ItemSizeText
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="file-upload-item-size"
      {...rest}
    />
  );
};

export const FileUploadItemDeleteTrigger = (
  props: React.ComponentProps<typeof ArkFileUpload.ItemDeleteTrigger>
) => (
  <ArkFileUpload.ItemDeleteTrigger
    data-slot="file-upload-item-delete-trigger"
    {...props}
  />
);

export const FileUploadClearTrigger = (
  props: React.ComponentProps<typeof ArkFileUpload.ClearTrigger>
) => (
  <ArkFileUpload.ClearTrigger
    data-slot="file-upload-clear-trigger"
    {...props}
  />
);

export const FileUploadRootProvider = (
  props: React.ComponentProps<typeof ArkFileUpload.RootProvider>
) => (
  <ArkFileUpload.RootProvider
    data-slot="file-upload-root-provider"
    {...props}
  />
);
