const qrTextInput = document.getElementById('qrText');
const generateTextBtn = document.getElementById('generateTextBtn');
const genFileInput = document.getElementById('genFileInput');
const generateFromFileBtn = document.getElementById('generateFromFileBtn');
const qrCanvas = document.getElementById('qrCanvas');

let genLastDecodedText = "";

generateTextBtn.addEventListener('click', () => {
  const text = qrTextInput.value.trim();
  if (!text) {
    alert("Please enter some text.");
    return;
  }
  QRCode.toCanvas(qrCanvas, text, error => {
    if (error) alert("Failed to generate QR code.");
  });
});

genFileInput.addEventListener('change', () => {
  const file = genFileInput.files[0];
  if (!file) return;
  genLastDecodedText = "";
  generateFromFileBtn.disabled = true;

  if (file.type.startsWith('image/')) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        genLastDecodedText = code.data;
        alert("QR code detected in image and ready to generate.");
        generateFromFileBtn.disabled = false;
      } else {
        alert("No QR code found in the image.");
      }
    };
    img.src = URL.createObjectURL(file);

  } else if (file.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.play();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.addEventListener('loadeddata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const interval = setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(frame.data, frame.width, frame.height);
        if (code) {
          genLastDecodedText = code.data;
          alert("QR code detected in video and ready to generate.");
          generateFromFileBtn.disabled = false;
          clearInterval(interval);
          video.pause();
        }
      }, 500);
    });

  } else {
    alert("Please upload an image or video file.");
  }
});

generateFromFileBtn.addEventListener('click', () => {
  if (!genLastDecodedText) {
    alert("No text decoded from the uploaded file.");
    return;
  }
  QRCode.toCanvas(qrCanvas, genLastDecodedText, error => {
    if (error) alert("Failed to generate QR code.");
  });
});
