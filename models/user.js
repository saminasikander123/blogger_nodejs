// user.js
let mongoose = require('mongoose')
// let crypto = require('crypto')
let bcrypt = require('bcrypt')
let nodeify = require('bluebird-nodeify')

require('songbird')

let userSchema = mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    blogTitle:  String,
    blogDescription:  String
})

userSchema.methods.generateHash = async function(password) {
  return await bcrypt.promise.hash(password, 8)
}

userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.promise.compare(password, this.password)
}

userSchema.path('password').validate((pw) => {
  console.log('password validate')
  return (pw.length >= 4) && (/[A-Z]/.test(pw)) && (/[a-z]/.test(pw)) &&
    (/[0-9]/.test(pw))
})

// userSchema.pre('save', (callback)=>{ -- Very interesting reason for not using this
// Video walkthrough 51:48
userSchema.pre('save', function(next) {
  // console.log('this.isModified: ', this)
  nodeify(async () => {
    if (!this.isModified('password')) return next()
    this.password = await this.generateHash(this.password)
  }(), next)
})


module.exports = mongoose.model('User', userSchema)
