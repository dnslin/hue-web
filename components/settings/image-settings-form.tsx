"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImageSettingsFormData,
  imageSettingsSchema,
  ImageProcessingSetting,
  watermarkPositionOptions,
  WATERMARK_POSITIONS,
} from "@/lib/types/settings";
import {
  SettingsFormWrapper,
  SettingsFormSection,
} from "./settings-form-wrapper";
import {
  LabeledInput,
  LabeledSwitch,
  LabeledNumberInput,
  LabeledSlider,
} from "./form-components";
import { WatermarkPositionSelector } from "./watermark-position-selector";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Image, Upload, Scissors, Droplets } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ImageSettingsFormProps {
  data: ImageProcessingSetting | null;
  onSubmit: (data: ImageSettingsFormData) => Promise<boolean>;
  isSubmitting?: boolean;
  error?: string | null;
}

export const ImageSettingsForm = ({
  data,
  onSubmit,
  isSubmitting = false,
  error,
}: ImageSettingsFormProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ImageSettingsFormData>({
    resolver: zodResolver(imageSettingsSchema) as any,
    defaultValues: {
      uploadMaxSizeMB: 10,
      allowedImageFormats: "jpg,jpeg,png,gif,webp",
      batchUploadLimit: 10,
      autoCompressEnabled: true,
      compressionQuality: 85,
      thumbnailEnabled: true,
      thumbnailWidth: 300,
      thumbnailHeight: 300,
      watermarkEnabled: false,
      watermarkPosition: WATERMARK_POSITIONS.BOTTOM_RIGHT,
      watermarkSourceFile: "",
      watermarkOpacity: 0.8,
      watermarkScaleRatio: 0.1,
      watermarkMarginX: 20,
      watermarkMarginY: 20,
    },
  });

  // 当数据变化时更新表单
  useEffect(() => {
    if (data) {
      form.reset({
        uploadMaxSizeMB: data.uploadMaxSizeMB || 10,
        allowedImageFormats:
          data.allowedImageFormats || "jpg,jpeg,png,gif,webp",
        batchUploadLimit: data.batchUploadLimit || 10,
        autoCompressEnabled: data.autoCompressEnabled ?? true,
        compressionQuality: data.compressionQuality || 85,
        thumbnailEnabled: data.thumbnailEnabled ?? true,
        thumbnailWidth: data.thumbnailWidth || 300,
        thumbnailHeight: data.thumbnailHeight || 300,
        watermarkEnabled: data.watermarkEnabled ?? false,
        watermarkPosition:
          (data.watermarkPosition as any) || WATERMARK_POSITIONS.BOTTOM_RIGHT,
        watermarkSourceFile: data.watermarkSourceFile || "",
        watermarkOpacity: data.watermarkOpacity || 0.8,
        watermarkScaleRatio: data.watermarkScaleRatio || 0.1,
        watermarkMarginX: data.watermarkMarginX || 20,
        watermarkMarginY: data.watermarkMarginY || 20,
      });
    }
  }, [data, form]);

  // 清除成功消息
  useEffect(() => {
    if (error) {
      setSuccessMessage(null);
    }
  }, [error]);

  const handleSubmit = async (formData: ImageSettingsFormData) => {
    try {
      setSuccessMessage(null);
      const success = await onSubmit(formData);

      if (success) {
        setSuccessMessage("图片设置已成功保存！");
        toast.success("图片设置已保存");

        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error("保存图片设置失败:", err);
      toast.error("保存失败，请重试");
    }
  };

  const { watch } = form;
  const watchedValues = watch();

  return (
    <SettingsFormWrapper
      form={form as any}
      onSubmit={handleSubmit}
      title="图片处理设置"
      description="配置图片上传、压缩、缩略图和水印等处理功能"
      isSubmitting={isSubmitting}
      error={error}
      successMessage={successMessage}
      saveButtonText="保存图片设置"
    >
      {/* 上传限制区域 */}
      <SettingsFormSection
        title="上传限制"
        description="设置图片上传的基本限制和格式要求"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledNumberInput
            label="最大文件大小 (MB)"
            name="uploadMaxSizeMB"
            register={form.register}
            error={form.formState.errors.uploadMaxSizeMB}
            placeholder="10"
            min={1}
            max={100}
            tooltip="单个图片文件的最大上传大小"
            description="建议设置为1-50MB之间"
          />

          <LabeledNumberInput
            label="批量上传限制"
            name="batchUploadLimit"
            register={form.register}
            error={form.formState.errors.batchUploadLimit}
            placeholder="10"
            min={1}
            max={100}
            tooltip="一次可以上传的图片数量限制"
            description="建议设置为5-20张之间"
          />
        </div>

        <LabeledInput
          label="允许的图片格式"
          name="allowedImageFormats"
          register={form.register}
          error={form.formState.errors.allowedImageFormats}
          placeholder="jpg,jpeg,png,gif,webp"
          tooltip="允许上传的图片格式，用逗号分隔"
          description="常用格式：jpg, jpeg, png, gif, webp, svg"
        />

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            上传限制影响所有用户的图片上传功能。请根据服务器存储和带宽情况合理设置。
          </AlertDescription>
        </Alert>
      </SettingsFormSection>

      {/* 压缩处理区域 */}
      <SettingsFormSection
        title="压缩处理"
        description="配置图片自动压缩功能，节省存储空间"
      >
        <LabeledSwitch
          label="启用自动压缩"
          description="上传时自动压缩图片以节省存储空间"
          checked={watchedValues.autoCompressEnabled}
          onCheckedChange={(checked) =>
            form.setValue("autoCompressEnabled", checked, {
              shouldDirty: true,
            })
          }
          tooltip="开启后会自动压缩上传的图片，可能会影响图片质量"
        />

        {watchedValues.autoCompressEnabled && (
          <LabeledSlider
            label="压缩质量"
            value={watchedValues.compressionQuality}
            onValueChange={(value) =>
              form.setValue("compressionQuality", value, { shouldDirty: true })
            }
            min={10}
            max={100}
            step={5}
            tooltip="压缩质量，数值越高质量越好但文件越大"
            description="推荐设置：70-90之间"
            formatValue={(value) => `${value}%`}
          />
        )}
      </SettingsFormSection>

      {/* 缩略图设置区域 */}
      <SettingsFormSection
        title="缩略图设置"
        description="配置图片缩略图的生成和尺寸"
      >
        <LabeledSwitch
          label="启用缩略图生成"
          description="自动为上传的图片生成缩略图"
          checked={watchedValues.thumbnailEnabled}
          onCheckedChange={(checked) =>
            form.setValue("thumbnailEnabled", checked, { shouldDirty: true })
          }
          tooltip="缩略图用于快速预览，建议开启"
        />

        {watchedValues.thumbnailEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LabeledNumberInput
              label="缩略图宽度 (px)"
              name="thumbnailWidth"
              register={form.register}
              error={form.formState.errors.thumbnailWidth}
              placeholder="300"
              min={50}
              max={800}
              tooltip="缩略图的宽度，单位为像素"
              description="建议设置为150-400px"
            />

            <LabeledNumberInput
              label="缩略图高度 (px)"
              name="thumbnailHeight"
              register={form.register}
              error={form.formState.errors.thumbnailHeight}
              placeholder="300"
              min={50}
              max={800}
              tooltip="缩略图的高度，单位为像素"
              description="建议设置为150-400px"
            />
          </div>
        )}
      </SettingsFormSection>

      {/* 水印配置区域 */}
      <SettingsFormSection
        title="水印配置"
        description="为上传的图片添加水印，保护版权"
      >
        <LabeledSwitch
          label="启用水印功能"
          description="为上传的图片自动添加水印"
          checked={watchedValues.watermarkEnabled}
          onCheckedChange={(checked) =>
            form.setValue("watermarkEnabled", checked, { shouldDirty: true })
          }
          tooltip="水印可以保护图片版权，防止盗用"
        />

        {watchedValues.watermarkEnabled && (
          <div className="space-y-6">
            {/* 水印位置选择器 */}
            <WatermarkPositionSelector
              value={watchedValues.watermarkPosition}
              onValueChange={(value) =>
                form.setValue("watermarkPosition", value as any, {
                  shouldDirty: true,
                })
              }
            />

            {/* 水印文件 */}
            <LabeledInput
              label="水印文件路径"
              name="watermarkSourceFile"
              register={form.register}
              error={form.formState.errors.watermarkSourceFile}
              placeholder="/path/to/watermark.png"
              tooltip="水印图片文件的路径，支持PNG、JPG格式"
              description="建议使用透明背景的PNG文件作为水印"
            />

            {/* 水印参数设置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LabeledSlider
                label="水印透明度"
                value={watchedValues.watermarkOpacity * 100}
                onValueChange={(value) =>
                  form.setValue("watermarkOpacity", value / 100, {
                    shouldDirty: true,
                  })
                }
                min={10}
                max={100}
                step={5}
                tooltip="水印的透明度，数值越小越透明"
                description="推荐设置：60-90%"
                formatValue={(value) => `${value}%`}
              />

              <LabeledSlider
                label="水印缩放比例"
                value={watchedValues.watermarkScaleRatio * 100}
                onValueChange={(value) =>
                  form.setValue("watermarkScaleRatio", value / 100, {
                    shouldDirty: true,
                  })
                }
                min={5}
                max={50}
                step={1}
                tooltip="水印相对于原图的大小比例"
                description="推荐设置：10-20%"
                formatValue={(value) => `${value}%`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledNumberInput
                label="水平边距 (px)"
                name="watermarkMarginX"
                register={form.register}
                error={form.formState.errors.watermarkMarginX}
                placeholder="20"
                min={0}
                max={200}
                tooltip="水印距离图片边缘的水平距离"
                description="建议设置为10-50px"
              />

              <LabeledNumberInput
                label="垂直边距 (px)"
                name="watermarkMarginY"
                register={form.register}
                error={form.formState.errors.watermarkMarginY}
                placeholder="20"
                min={0}
                max={200}
                tooltip="水印距离图片边缘的垂直距离"
                description="建议设置为10-50px"
              />
            </div>
          </div>
        )}
      </SettingsFormSection>
    </SettingsFormWrapper>
  );
};
