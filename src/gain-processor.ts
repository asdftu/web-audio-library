declare global {
  interface Window {webkitAudioContext : any; }
}

export class GainProcessor {
  private audioContext: any;
  private gainNode: any;
  private sourceNode: any;
  constructor(sourceNode: any, audioCtx: any = null) {
    this.audioContext = audioCtx;
    this.sourceNode = sourceNode;
    this.initializeAudioContext();
  }
  private _isMute = true;
  public get isMute() {
    return this._isMute;
  }
  public set isMute(v) {
    this._isMute = v;
    this.setVolume(v ? 0 : 1);
  }
  public toggleMute() {
    this.isMute = !this.isMute;
  }
  public resumeAudioContext() {
    this.audioContext.resume().then(() => {
      console.log('AudioContext resumed successfully');
    });
  }

  private initializeAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      console.log('create audioContext instance internal');
    }
    this.gainNode = this.audioContext.createGain();
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.isMute = this.isMute;

    console.log('audioContext has initialized!');
  }

  public setVolume(v: number) {
    // this.gainNode.gain.value = v;
    this.gainNode.gain.setValueAtTime(v, this.audioContext.currentTime);
    console.log(`change gain node value to ${v}`);
  }

}
