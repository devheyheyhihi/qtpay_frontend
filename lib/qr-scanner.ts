// QR 코드 스캔 유틸리티

export async function scanQRFromVideo(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): Promise<string | null> {
  const canvas = canvasElement;
  const video = videoElement;
  const ctx = canvas.getContext('2d');
  
  if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
    return null;
  }
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // jsQR 라이브러리 동적 import
  try {
    const jsQR = (await import('jsqr')).default;
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    
    if (code) {
      return code.data;
    }
  } catch (error) {
    console.error('QR 스캔 오류:', error);
  }
  
  return null;
}

