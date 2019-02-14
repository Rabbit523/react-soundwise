export function getTime_mmss(seconds) {
  if (seconds > 0) {
    const _progressMinutes = Math.floor(seconds / 60);
    const _progressSeconds = Math.floor(seconds - _progressMinutes * 60);
    return `${(_progressMinutes < 10 && `0${_progressMinutes}`) ||
      _progressMinutes}:${(_progressSeconds < 10 && `0${_progressSeconds}`) || _progressSeconds}`;
  } else {
    return '00:00';
  }
}
