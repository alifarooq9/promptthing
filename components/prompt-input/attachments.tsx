"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { IconCloudUpload, IconPaperclip } from "@tabler/icons-react";
import React, { useState } from "react";

type AttachmentsProps = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export function Attachments({ files, setFiles }: AttachmentsProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  console.log("Selected files:", files);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("rounded-full cursor-pointer")}
        >
          <IconPaperclip />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        <DropdownMenuLabel>Attachments</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <label htmlFor="file-upload">
            <IconCloudUpload /> Add photos and files
          </label>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept="image/*, .pdf, text/*"
      />
    </DropdownMenu>
  );
}
