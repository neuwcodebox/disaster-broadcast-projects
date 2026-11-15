// Original procedural sound designs for 「수신 대기」. CC0-1.0.
export function room({ Tone, context, duration, sampleRate, random }) {
  const buffer = context.createBuffer(1, Math.round(duration * sampleRate), sampleRate);
  const data = buffer.getChannelData(0);
  let low = 0;
  for (let i=0;i<data.length;i++) {
    low=low*0.985+(random()*2-1)*0.015;
    data[i]=0.065*Math.sin(2*Math.PI*59.7*i/sampleRate)+0.029*Math.sin(2*Math.PI*119.4*i/sampleRate)+0.6*low;
  }
  new Tone.Player(buffer).toDestination().start(0);
}
export function receiver({ Tone, duration }) {
  const gain=new Tone.Gain(0).toDestination();
  for(let t=0;t<duration;t+=2) {
    gain.gain.setValueAtTime(0,t);
    gain.gain.linearRampToValueAtTime(.25,t+.035);
    gain.gain.setValueAtTime(.25,t+.79);
    gain.gain.linearRampToValueAtTime(0,t+.85);
  }
  for(const f of [437,483]) new Tone.Oscillator(f,'sine').connect(gain).start(0).stop(duration);
}
export function carrier({ Tone, duration }) {
  const gain=new Tone.Gain(0).toDestination();
  gain.gain.linearRampToValueAtTime(.09,3);
  gain.gain.setValueAtTime(.09,duration-4);
  gain.gain.linearRampToValueAtTime(0,duration);
  const drift=new Tone.LFO({frequency:.127,min:176.9,max:177.1}).start(0);
  const a=new Tone.Oscillator(177,'sine').connect(gain).start(0).stop(duration);
  drift.connect(a.frequency);
  new Tone.Oscillator(181,'sine').connect(gain).start(0).stop(duration);
}
