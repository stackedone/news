const apiKey = 'd318cd14451640629fbd4eb52fa895b3'
const main = document.querySelector('main')
const sourceSelector = document.querySelector('#sourceSelector')
const defaultSource = 'reuters'

window.addEventListener('load', async e => {
  updateNews()
  await updateSources()

  sourceSelector.value = defaultSource
  sourceSelector.addEventListener('change', e => updateNews(e.target.value))

  if('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('sw.js')
      console.log('Serviceworker registered')
    } catch (err) {
      console.error('serviceworker not found', err)
    }
  }
})

async function updateSources() {

  const res = await fetch(`https://newsapi.org/v2/sources?apiKey=${apiKey}`)
  const json = await res.json()

  sourceSelector.innerHTML = json.sources.map(src => `<option value="${src.id}">${src.name}</option>`).join('\n')
}

async function updateNews(source = defaultSource) {
  const res = await fetch(`https://newsapi.org/v2/everything?sources=${source}&language=en&apiKey=${apiKey}`)
  const json = await res.json()

  main.innerHTML = json.articles.map(createArticle).join('\n')
}

function createArticle(article) {
  return `<div class="article">
            <a href="${article.url}">
              <h2>${article.title}</h2>
              <img src="${article.urlToImage}">
              <p>${article.description}</p>
            </a>
          </div>`
}
