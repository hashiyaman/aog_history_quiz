'use strict';

const fs = require('fs');
const path = require('path');

const FILE_PASSWD = path.join(__dirname, 'passwd');

const getVerification = () => {
    return new Promise((resolve) => {
        fs.readFile(FILE_PASSWD, 'utf-8', (err, data) => {
            if (err) {
                throw err;
            }

            const verification = {
                verification: {
                    Authorization: 'Bearer ' + data
                }
            };
            resolve(verification);
        });
    });
}

module.exports = { getVerification };