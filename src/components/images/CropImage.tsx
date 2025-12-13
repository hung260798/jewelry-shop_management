import React from "react";
import { Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";

// Utility: resize image to max 300px width
const resizeImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Scale down if width > 300
        const scale = Math.min(1, 300 / img.width);
        const size = img.width * scale; // since it's square, width = height

        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, 0, 0, size, size);

        canvas.toBlob((blob) => {
          const newFile = new File([blob], file.name, { type: file.type });
          resolve(newFile);
        }, file.type);
      };
    };
    reader.readAsDataURL(file);
  });

const beforeUpload = async (file) => {
  // Resize after crop
  const resized = await resizeImage(file);
  return resized;
};

export default function AvatarUpload() {
  return (
    <ImgCrop aspect={1} cropShape="rect" quality={1}>
      <Upload
        name="avatar"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={beforeUpload}
        action="/upload" // replace with your API endpoint
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      </Upload>
    </ImgCrop>
  );
}
