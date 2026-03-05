import puppeteer from "puppeteer";
import cloudinary from "../config/cloudinary.js";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

export const generatePDF = async (html) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
};

export const uploadPDF = async (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          folder: "offers",
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      )
      .end(buffer);
  });
};
