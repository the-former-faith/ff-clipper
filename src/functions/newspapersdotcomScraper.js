//Use https://www.yourjs.com/bookmarklet/ to create bookmarklet

var openOCR = () => {
  var showOCR = document.getElementById('fn-showocr')
  showOCR.click()
  setTimeout(scrapeData, 2000);
}

var scrapeData = () => {
  var title = document.getElementById('title').innerText
  var clipping = document.getElementById('spotlight')
  var ocrText = clipping.getElementsByClassName('ocrtext')[0].innerText
  var image = clipping.querySelectorAll('#sl-image img')[0]
  
  var breadcrumbs = document.querySelectorAll('.breadcrumb li span')
  
  var bc = Array.from(breadcrumbs).map(a => {
    return a.innerText
  })
  
  var months = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12'
  }
  
  var date = `${bc[4]}-${months[bc[5]]}-${('0' + bc[6]).slice(-2)}`
  
  var data = {
    title: title,
    text: ocrText,
    image: image.src,
    newspaper: bc[3],
    date: date,
    page: bc[7].slice(5),
    city: bc[2],
    state: bc[1],
    url: window.location.href
  }

  const qs = Object.keys(data)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');

  window.location.href = 'https://clipper.theformer.faith?' + qs
}

openOCR()