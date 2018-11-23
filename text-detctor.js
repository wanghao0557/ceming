const request = require('request');
const fs = require('fs');
const path = require('path');
const images = require('images');
const textDetctor = function(imageBase64, callback) {
    var tempUrl = path.resolve(__dirname, './temp/temp.jpg');
    var dataBuffer = new Buffer(imageBase64, 'base64');
    images(dataBuffer).size(400).save(path.resolve(__dirname, './temp/temp.jpg'), {
        quality: 50
    });
    const newBase64 = Buffer.from(fs.readFileSync(tempUrl), 'binary').toString('base64');
    const url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=24.02d57fb90ce3d6465ff7844138771457.2592000.1544162067.282335-14707763';
    const program = {
        image_type: 'BASE64',
        group_id: 'group001',
        user_id: '001',
        image: newBase64
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
            fs.unlinkSync(tempUrl);
            callback(null, JSON.parse(body));
        }
    );
};
module.exports = textDetctor;
