const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.handler = async function (event) {
  page = axios.get('https://www.newspapers.com/clip/72082117/the-leon-journal-reporter').then(response => {
    const dom = new JSDOM(response.data);
    console.log(dom.window.document.querySelectorAll('#sl-image img')[0].src)
  })
  .catch(error => {
    console.log(error);
  });

  return {
    statusCode: 200,
    body: JSON.stringify({message: "Uploaded!", asset: page})
  }
}