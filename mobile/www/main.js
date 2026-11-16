const videoInput = document.querySelector('#video')
const videoName = document.querySelector('#videoName')
const scriptInput = document.querySelector('#script')
const voiceButton = document.querySelector('#voice')
const renderButton = document.querySelector('#render')
const voiceStatus = document.querySelector('#voiceStatus')
const status = document.querySelector('#status')

videoInput.addEventListener('change', () => {
  videoName.textContent = videoInput.files?.[0]?.name ?? 'কোনো ভিডিও বাছাই করা হয়নি'
})

voiceButton.addEventListener('click', () => {
  if (!scriptInput.value.trim()) {
    voiceStatus.textContent = 'আগে narration লিখুন।'
    return
  }
  voiceStatus.textContent = 'বাংলা voice তৈরি হচ্ছে...'
  const native = window.Capacitor?.Plugins?.ShortsNative
  if (!native?.synthesizeSpeech) {
    voiceStatus.textContent = 'এই APK-তে native voice module নেই। নতুন APK install করুন।'
    return
  }
  native.synthesizeSpeech({ text: scriptInput.value.trim() })
    .then(result => {
      voiceStatus.textContent = `Voice তৈরি হয়েছে: ${result.path.split('/').pop()}`
      voiceButton.dataset.voicePath = result.path
    })
    .catch(error => {
      voiceStatus.textContent = error?.message || 'Voice তৈরি করা যায়নি।'
    })
})

renderButton.addEventListener('click', () => {
  if (!videoInput.files?.length) {
    status.textContent = 'আগে একটি ভিডিও বাছাই করুন।'
    return
  }
  if (!voiceButton.dataset.voicePath) {
    status.textContent = 'আগে বাংলা voice তৈরি করুন।'
    return
  }
  status.textContent = 'Voice তৈরি হয়েছে। Video renderer পরের ধাপে যুক্ত হবে।'
})
