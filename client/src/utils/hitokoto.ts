export async function fetchHitokoto() {
    const response = await fetch('https://api.obdo.cc/hitokoto/?encode=text')
    const hitokotoText = await response.text()
    const hitokotos = document.querySelectorAll('[id="hitokoto_text"]')
    hitokotos.forEach(hitokoto => {
      hitokoto.innerHTML = hitokotoText
    })
  }