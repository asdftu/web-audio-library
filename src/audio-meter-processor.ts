declare global {
  interface Window {webkitAudioContext : any; }
}

const dBRange = 48;
const getBaseLog = (x: number) => {
  return Math.log(x) / Math.log(10);
};

const UVMeterCalcUtils = {
  dbFromFloat: (floatVal: number) => {
    return getBaseLog(floatVal) * 20;
  },

  percentFromdB: (dB: number) => {
    return Math.floor(((dB + dBRange) / dBRange) * 100);
  }
};

export class AudioMeterProcessor {
  private audioContext: any;
  private channelCount: number = 2;
  private sourceNode: any;
  private percentArray: number[] = [];
  private vuMeterCallback: ((vu: number[]) => void) | null = null;

  constructor(sourceNode: any, callback: (vu: number[]) => void, audioCtx: any = null) {
    this.audioContext = audioCtx;
    this.sourceNode = sourceNode;
    this.vuMeterCallback = callback;
    this.initializeAudioContext();
  }
  public resumeAudioContext() {
    this.audioContext.resume().then(() => {
      console.log('AudioContext resumed successfully');
    });
  }

  private updateMeter(audioProcessingEvent: AudioProcessingEvent) {
    let inputBuffer = audioProcessingEvent.inputBuffer;
    let i;
    let channelData = [];
    let channelMaxes = [];
    for (i = 0; i < this.channelCount; i++) {
      channelData[i] = inputBuffer.getChannelData(i);
      channelMaxes[i] = 0.0;
    }
    for (let sample = 0; sample < inputBuffer.length; sample++) {
      for (i = 0; i < this.channelCount; i++) {
        if (Math.abs(channelData[i][sample]) > channelMaxes[i]) {
          channelMaxes[i] = Math.abs(channelData[i][sample]);
        }
      }
    }
    let dBs = new Array(this.channelCount);
    for (i = 0; i < this.channelCount; i++) {
      let dB = UVMeterCalcUtils.dbFromFloat(channelMaxes[i]);
      dBs[i] = UVMeterCalcUtils.percentFromdB(dB);
      if (this.vuMeterCallback) {
        this.vuMeterCallback(dBs);
      }
    }
  }

  private initializeAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      console.log('create audioContext instance internal');
    }
    let c = this.channelCount = this.sourceNode.channelCount;
    let meterNode = this.audioContext.createScriptProcessor(8192, c, c);
    meterNode.onaudioprocess = this.updateMeter.bind(this);
    this.sourceNode.connect(meterNode);
    meterNode.connect(this.audioContext.destination);

    console.log('audioContext has initialized!');
  }

  public release() {
    this.vuMeterCallback = null;
  }
}
