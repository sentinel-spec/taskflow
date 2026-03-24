"use client";

import { observer } from "mobx-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getCoverImageDisplayURL,
  STATIC_COVER_IMAGES,
} from "@/core/helpers/cover-image.helper";
import { useCommonTranslations } from "@/i18n/hooks";

type Props = {
  label: string | React.ReactNode;
  value: string | null;
  onChange: (data: string) => void;
  disabled?: boolean;
  tabIndex?: number;
};

export const ImagePickerPopover = observer(function ImagePickerPopover(
  props: Props,
) {
  const { label, value, onChange, disabled = false, tabIndex } = props;
  const t = useCommonTranslations();

  const [image, setImage] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"images" | "upload">("images");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, fileRejections, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxSize: 5 * 1024 * 1024,
    });

  const handleStaticImageSelect = (imageUrl: string) => {
    onChange(imageUrl);
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setIsImageUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
      setIsImageUploading(false);
      setImage(null);
      setIsOpen(false);
    };
    reader.readAsDataURL(image);
  };

  const toggleDropdown = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    toggleDropdown();
  };

  // Get random cover images for display (shuffle each time)
  const displayImages = React.useMemo(() => {
    const allImages = Object.values(STATIC_COVER_IMAGES);
    // Shuffle array
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    return shuffled;
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOnClick}
          disabled={disabled}
          tabIndex={tabIndex}
          type="button"
          className="bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-sm"
        >
          {label}
        </Button>
      </PopoverTrigger>

      {isOpen && (
        <PopoverContent
          className="z-[80] h-[26rem] max-h-[60vh] w-[32rem] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
          sideOffset={5}
          align="end"
        >
          <div className="flex h-full min-h-0 flex-col">
            {/* Tabs */}
            <div className="flex rounded-t-md bg-gray-100 p-1">
              <button
                type="button"
                className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "images"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("images")}
              >
                {t("images")}
              </button>
              <button
                type="button"
                className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "upload"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                {t("upload")}
              </button>
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
              onWheelCapture={(e) => e.stopPropagation()}
            >
              {activeTab === "images" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {displayImages.map((imageUrl, index) => (
                      <button
                        type="button"
                        key={imageUrl}
                        className="relative col-span-2 aspect-video cursor-pointer rounded-md overflow-hidden"
                        onClick={() => handleStaticImageSelect(imageUrl)}
                      >
                        {/* biome-ignore lint/performance/noImgElement: Static picker thumbnails can be plain img here. */}
                        <img
                          src={imageUrl}
                          alt={`Cover ${index + 1}`}
                          className="absolute top-0 left-0 h-full w-full object-cover transition-opacity hover:opacity-80"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "upload" && (
                <div className="flex flex-col gap-y-3">
                  <div
                    {...getRootProps()}
                    className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {image || value ? (
                      <>
                        {/* biome-ignore lint/performance/noImgElement: File preview uses local object URL/base64 and must render immediately. */}
                        <img
                          src={
                            image
                              ? URL.createObjectURL(image)
                              : getCoverImageDisplayURL(value, "")
                          }
                          alt="preview"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          {isDragActive
                            ? t("dropImageHere")
                            : t("dragAndDropImageHere")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("orClickToSelect")}
                        </p>
                      </div>
                    )}
                    <input {...getInputProps()} />
                  </div>

                  {fileRejections.length > 0 && (
                    <p className="text-xs text-red-600">
                      {fileRejections[0].errors[0].code === "file-too-large"
                        ? t("fileTooLarge")
                        : t("invalidImageFile")}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    {t("fileFormats", { formats: ".jpeg, .jpg, .png, .webp" })}
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!image || isImageUploading}
                    >
                      {isImageUploading ? t("uploading") : t("uploadAndSave")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
});
