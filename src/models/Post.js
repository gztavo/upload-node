const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const s3 = new aws.S3();

const PostShema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createadAt: {
        type: Date,
        default: Date.now,
    },
});

PostShema.pre('save', function () {
    if (!this.url) {
        this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
});// antes de salvar jogar uma url padrão.

PostShema.pre('remove', function () {
    if (process.env.STORAGE_TYPE == 's3') {
        return s3
        .deleteObject({
            Bucket: 'uploadnode',
            Key: this.key,
        }).promise()
    } else {
         return promisify(fs.unlink)(path.resolve(__dirname,'..', '..', 'tmp', 'uploads', this.key))
    }
});

module.exports = mongoose.model('Post', PostShema);