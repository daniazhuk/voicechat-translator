import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import tmp from 'tmp';

export const m4aBase64ToWavBase64 = (m4aBase64) => {
  ffmpeg.setFfmpegPath(ffmpegPath.path);
  return new Promise((resolve, reject) => {
    const m4aTmp = tmp.fileSync({ postfix: '.m4a' });
    const wavTmp = tmp.fileSync({ postfix: '.wav' });
    
    fs.writeFileSync(m4aTmp.name, Buffer.from(m4aBase64, 'base64'));
    
    ffmpeg(m4aTmp.name)
      .audioChannels(1)
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .format('wav')
      .on('error', err => {
        m4aTmp.removeCallback();
        wavTmp.removeCallback();
        reject(err);
      })
      .on('end', () => {
        const wavBuffer = fs.readFileSync(wavTmp.name);
        m4aTmp.removeCallback();
        wavTmp.removeCallback();
        resolve(wavBuffer.toString('base64'));
      })
      .save(wavTmp.name);
  });
}
