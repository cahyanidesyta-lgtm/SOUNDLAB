/* Web Audio API: suara hanya dimulai lewat interaksi pengguna; gain awal dibatasi. */
(function () {
  'use strict';
  class SoundEngine {
    constructor() { this.context=null; this.master=null; this.analyser=null; this.osc=null; this.toneGain=null; this.playing=false; this.micStream=null; this.micAnalyser=null; this.micSource=null; this.error=''; }
    init() {
      if(this.context) return;
      const AC=window.AudioContext || window.webkitAudioContext;
      if(!AC) throw new Error('Browser tidak mendukung Web Audio API.');
      const ctx = new AC();
      this.context=ctx;
      this.master=ctx.createGain(); this.master.gain.value=0.75;
      this.analyser=ctx.createAnalyser(); this.analyser.fftSize=2048;
      this.master.connect(this.analyser); this.analyser.connect(ctx.destination);
    }
    async ensure() { this.init(); if(this.context.state === 'suspended') await this.context.resume(); }
    async start(frequency=440, amplitude=25, waveform='sine') {
      await this.ensure(); this.stop();
      const osc=this.context.createOscillator(), gain=this.context.createGain();
      osc.type=waveform; osc.frequency.setValueAtTime(Math.max(40,Math.min(2400,Number(frequency))),this.context.currentTime);
      gain.gain.setValueAtTime(0,this.context.currentTime);
      gain.gain.linearRampToValueAtTime(this.toGain(amplitude),this.context.currentTime+0.06);
      osc.connect(gain); gain.connect(this.master); osc.start();
      this.osc=osc; this.toneGain=gain; this.playing=true;
    }
    update(frequency,amplitude,waveform) {
      if(!this.playing || !this.context) return;
      const now=this.context.currentTime;
      this.osc.frequency.setTargetAtTime(Math.max(40,Math.min(2400,Number(frequency))),now,0.025);
      if(this.osc.type!==waveform) this.osc.type=waveform;
      this.toneGain.gain.setTargetAtTime(this.toGain(amplitude),now,0.03);
    }
    toGain(amplitude){ return Math.min(0.14,Math.max(0,Number(amplitude)/100)*0.12); }
    stop(){
      if(!this.osc || !this.context){this.playing=false;return;}
      const osc=this.osc, gain=this.toneGain,now=this.context.currentTime;
      gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(0,now,0.015);
      try { osc.stop(now+0.09); } catch (_) {}
      setTimeout(()=>{try{osc.disconnect();gain.disconnect()}catch(_){ }},180);
      this.osc=null;this.toneGain=null;this.playing=false;
    }
    async echo(distance=40,reflection=0.45,frequency=520,amplitude=35){
      await this.ensure();
      const ctx=this.context; const now=ctx.currentTime;
      const delaySeconds=Math.max(0.01,Math.min(1.5,2*Number(distance)/343));
      const source=ctx.createOscillator(),envelope=ctx.createGain();
      const delay=ctx.createDelay(2),feedback=ctx.createGain(),wet=ctx.createGain();
      source.type='sine';source.frequency.value=Number(frequency);
      envelope.gain.setValueAtTime(0,now);
      envelope.gain.linearRampToValueAtTime(this.toGain(amplitude),now+0.008);
      envelope.gain.exponentialRampToValueAtTime(0.0001,now+0.16);
      delay.delayTime.value=delaySeconds;
      feedback.gain.value=Math.min(0.48,Number(reflection)*0.50);
      wet.gain.value=Math.min(0.95,Number(reflection));
      source.connect(envelope);envelope.connect(this.master);
      envelope.connect(delay);delay.connect(wet);wet.connect(this.master);
      delay.connect(feedback);feedback.connect(delay);
      source.start(now);source.stop(now+0.17);
      setTimeout(()=>{[source,envelope,delay,feedback,wet].forEach(n=>{try{n.disconnect()}catch(_){}})},4200);
    }
    async startMic(){
      if(!navigator.mediaDevices?.getUserMedia) throw new Error('Mikrofon membutuhkan HTTPS atau localhost.');
      await this.ensure();this.stopMic();
      this.micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      this.micSource=this.context.createMediaStreamSource(this.micStream);
      this.micAnalyser=this.context.createAnalyser();this.micAnalyser.fftSize=2048;
      // Tidak menghubungkan mikrofon ke speaker, untuk mencegah umpan balik akustik.
      this.micSource.connect(this.micAnalyser);
    }
    stopMic(){if(this.micSource){this.micSource.disconnect();this.micSource=null;}if(this.micStream){this.micStream.getTracks().forEach(t=>t.stop());this.micStream=null;}this.micAnalyser=null;}
    async close(){this.stop();this.stopMic();if(this.context){await this.context.close();}this.context=null;this.master=null;this.analyser=null;}
  }
  window.soundEngine=new SoundEngine();
})();
