import { PlusOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import ImgCrop from "antd-img-crop";

// Utility: resize image to max 300px width
const resizeImage: (file: File) => Promise<File> = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Scale down if width > 300
      const scale = Math.min(1, 300 / img.width);
      const size = img.width * scale; // since it's square, width = height

      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context error"));
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Blob error"));

          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        file.type,
        0.9
      );
    };
    img.onerror = reject;
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });

const beforeUpload = async (file: File) => {
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
          <div className="mt-2">Upload</div>
        </div>
      </Upload>
    </ImgCrop>
  );
}
