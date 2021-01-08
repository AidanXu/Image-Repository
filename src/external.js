
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

    request.end(res => {
        if (res.error) throw new Error(res.error);

        console.log(res.body);
    })
}

async function thesaurus(word) {

    var request = unirest('GET', config.get('Thesaurus.url') + "/" + config.get('Thesaurus.apiKey') + '/' + word + '/' + 'json');

    request.end(res => {
        if (res.error) throw new Error(res.error);
        console.log(res.body);
    });

}

module.exports.classifyImage = classifyImage;
module.exports.thesaurus = thesaurus;