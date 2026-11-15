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
  voiceStatus.textContent = 'Voice তৈরির backend এখনো যুক্ত করা হয়নি।'
})

renderButton.addEventListener('click', () => {
  if (!videoInput.files?.length) {
    status.textContent = 'আগে একটি ভিডিও বাছাই করুন।'
    return
  }
  status.textContent = 'Editor backend যুক্ত হলে এখানে output-short.mp4 তৈরি হবে।'
})
