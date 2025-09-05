# OCR Setup Guide for Medicine Recommendation

This guide helps you set up the OCR (Optical Character Recognition) functionality for the medicine recommendation feature.

## Prerequisites

### Windows (Recommended)
1. **Download Tesseract OCR:**
   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Download the latest Windows installer (e.g., `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)
   - Run the installer as Administrator

2. **Installation Steps:**
   - Choose installation directory (default: `C:\Program Files\Tesseract-OCR`)
   - Make sure to check "Add to PATH" during installation
   - If not added automatically, manually add to PATH:
     ```
     C:\Program Files\Tesseract-OCR
     ```

3. **Verify Installation:**
   - Open new Command Prompt or PowerShell
   - Run: `tesseract --version`
   - Should display version information

4. **Alternative Quick Install:**
   ```powershell
   # Using chocolatey (if installed)
   choco install tesseract
   
   # Using winget (Windows 10/11)
   winget install UB-Mannheim.Tesseract
   ```

### macOS
```bash
brew install tesseract
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install libtesseract-dev
```

## Python Dependencies

Install the required packages:

```bash
cd flaskServer
pip install -r requirements.txt
```

## Verify Installation

Test if Tesseract is working:

```bash
tesseract --version
```

Should output something like:
```
tesseract 5.x.x
```

## Usage

1. **Start the Flask server:**
   ```bash
   cd flaskServer
   python app.py
   ```

2. **Access the frontend** and navigate to Medicine Recommendation page

3. **Upload an image** of medicine packaging, prescription, or bottle

4. **The OCR will extract text** and find medicine alternatives

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- BMP
- TIFF

## Tips for Better OCR Results

1. **High-quality images:** Use clear, well-lit photos
2. **Text orientation:** Ensure text is horizontal and readable
3. **Contrast:** High contrast between text and background works best
4. **Resolution:** Higher resolution images generally work better
5. **Focus:** Ensure the text is in focus

## Troubleshooting

### Error: "pytesseract.pytesseract.TesseractNotFoundError"
- Ensure Tesseract is installed and in your PATH
- On Windows, add the installation path to environment variables

### Error: "No valid medicine name detected from image"
- Try a clearer image with better lighting
- Ensure the medicine name is clearly visible
- Check if the text is horizontal and readable

### Poor OCR accuracy
- Crop the image to focus on the medicine name
- Increase image resolution
- Improve lighting and contrast
