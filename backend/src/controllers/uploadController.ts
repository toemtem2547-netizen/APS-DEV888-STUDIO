import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    const { image, filename } = req.body as { image?: string; filename?: string };

    if (!image) {
      res.status(400).json({ success: false, message: 'กรุณาส่งข้อมูลรูปภาพ (image base64)' });
      return;
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Detect extension from base64 header or filename
    let extension = 'png';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
      if (match) {
        const mimeSub = match[1].toLowerCase();
        if (mimeSub.includes('jpeg') || mimeSub.includes('jpg')) extension = 'jpg';
        else if (mimeSub.includes('png')) extension = 'png';
        else if (mimeSub.includes('webp')) extension = 'webp';
        else if (mimeSub.includes('gif')) extension = 'gif';
        else extension = mimeSub;
        base64Data = image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      }
    } else if (filename && filename.includes('.')) {
      extension = filename.split('.').pop() || 'png';
    }

    const cleanExt = extension.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || 'png';
    const uniqueName = `reward-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
    const filePath = path.join(uploadsDir, uniqueName);

    const buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${uniqueName}`;

    res.json({
      success: true,
      message: 'อัปโหลดรูปภาพจากอุปกรณ์สำเร็จ',
      url: fileUrl,
      filename: uniqueName,
    });
  } catch (err: any) {
    console.error('Upload image error:', err);
    res.status(500).json({ success: false, message: err.message || 'Image upload failed' });
  }
}
