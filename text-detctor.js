const request = require('request');
const fs = require('fs');
const path = require('path');
const textDetctor = function(imageBase64, callback) {
    // let imageBuffer = fs.readFileSync(path.resolve(__dirname, filepath));
    // let imageBase64 = imageBuffer.toString('base64');
    const url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=24.02d57fb90ce3d6465ff7844138771457.2592000.1544162067.282335-14707763';
    const program = {
        image_type: 'BASE64',
        group_id: 'group001',
        user_id: '001',
        image: imageBase64
    };
    request.post(
        {
            url: url,
            form: program
        },
        function(err, httpResponse, body){
            if(err) {
                return callback(err);
            }
            callback(null, JSON.parse(body));
        }
    );
    function writeText(data) {
        let wordsResult = data.words_result;
        let len = wordsResult.length;
        let temArr = [];
        wordsResult.forEach(function(elem, index) {
            if(elem.words) {
                temArr.push(elem.words);
            }
        });
        writeText(temArr.join('\n'));
        fs.writeFile('book.txt', text, function(err) {
            if(err) {
                throw err;
            }
            console.log('file saved successful');
        });
    }
};
module.exports = textDetctor;
