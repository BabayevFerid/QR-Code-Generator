const readFileInput = document.getElementById('readFileInput');
const resultText = document.getElementById('resultText');
const readerCanvas = document.getElementById('readerCanvas');
const readerCtx = readerCanvas.getContext('2d');
const videoPlayer = document.getElementById('videoPlayer');

readFileInput.addEventListener('change', () => {
  const file = readFileInput.files[0];
  if (!file) return;

  resultText.textContent = "---";

  if (file.type.startsWith('image/')) {
    videoPlayer.hidden = true;
    readerCanvas.hidden = false;

    const img = new Image();
    img.onload = () => {
      readerCanvas.width = img.width;
      readerCanvas.height = img.height;
      readerCtx.drawImage(img, 0, 0);
      const imageData = readerCtx.getImageData(0, 0, readerCanvas.width, readerCanvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      resultText.textContent = code ? code.data : "No QR code found.";
    };
    img.src = URL.createObjectURL(file);

  } else if (file.type.startsWith('video/')) {
    readerCanvas.hidden = true;
    videoPlayer.hidden = false;
    videoPlayer.src = URL.createObjectURL(file);
    videoPlayer.play();

    videoPlayer.addEventListener('loadeddata', () => {
      readerCanvas.width = videoPlayer.videoWidth;
      readerCanvas.height = videoPlayer.videoHeight;

      const interval = setInterval(() => {
        readerCtx.drawImage(videoPlayer, 0, 0, readerCanvas.width, readerCanvas.height);
        const frame = readerCtx.getImageData(0, 0, readerCanvas.width, readerCanvas.height);
        const code = jsQR(frame.data, frame.width, frame.height);
        if (code) {
          resultText.textContent = code.data;
          clearInterval(interval);
          videoPlayer.pause();
        }
      }, 500);
    }, { once: true });

  } else {
    alert("Please upload an image or video file.");
    videoPlayer.hidden = true;
    readerCanvas.hidden = true;
  }
});
