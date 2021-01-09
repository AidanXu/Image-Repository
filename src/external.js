
const config = require('config');
const unirest = require('unirest');

async function classifyImage(url) {

    var request = unirest('GET', config.get('Watson.url'));

    request.query({
        "url" : url,
        "version" : "2020-03-19"
    })

    request.headers({
        'Authorization': config.get('Watson.apiKey')
    })
  
    return new Promise((resolve, reject) => {
        request.end(res => {
            if (res.error) throw new Error(res.error);
    
            console.log(res.body);
            resolve(res.body);
        })
    })
}

async function thesaurus(word) {

    var req = unirest("GET", "https://wordsapiv1.p.rapidapi.com/words/" + word + "/synonyms");

    req.headers({
        "x-rapidapi-key": config.get('Thesaurus.apiKey'),
        "x-rapidapi-host": config.get('Thesaurus.url'),
        "useQueryString": true
    });

    return new Promise((resolve, reject) => {
        req.end(res => {
            if (res.error) throw new Error(res.error);

            console.log(res.body);
            resolve(res.body);
        });
    })
}

module.exports.classifyImage = classifyImage;
module.exports.thesaurus = thesaurus;

//thesaurus("dog");
//classifyImage("https://specials-images.forbesimg.com/imageserve/dv424076/960x0.jpg?fit=scale");