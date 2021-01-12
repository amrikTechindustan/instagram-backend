const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgridTransporter = require('nodemailer-sendgrid-transport')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const requireLogin = require('../middleware/requireLogin')

const transporter = nodemailer.createTransport(sendgridTransporter({
    auth: {
        api_key: "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"
    }
}))
router.post('/signup', (req, res) => {
    console.log("Req body are", req.body)
    try {
        const { firstName, lastName, userName, email, contact, password, confirm_password } = JSON.parse(req.body.data);
        if (!firstName || !lastName || !userName || !email || !contact || !password || !confirm_password) {
            return res.status(422).json({ error: 'please add all the fields' })
        }
        else {
            User.findOne({ email: email })
                .then((savedUser) => {
                    if (savedUser) {
                        return res.status(422).json({ error: "user already exists with that email" })
                    }
                    bcrypt.hash(password, 12)
                        .then(hashedpassword => {
                            const user = new User({
                                firstName,
                                lastName,
                                userName,
                                email,
                                contact,
                                password: hashedpassword,
                                confirm_password
                            })
                            user.save()
                                .then(user => {
                                    res.json({ message: "Saved successfully" })
                                })
                                .catch(err => {
                                    console.log(err)
                                })
                        })

                })
                .catch(err => {
                    console.log(err)
                })
        }
    } catch (e) {
        console.log("E are", e);
    }
})
router.post('/signin', (req, res) => {
    const { email, password } = JSON.parse(req.body.data)
    if (!email || !password) {
        res.status(422).json({ error: "please add email or password" })
    }
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "invalid email and password" })
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                        res.json({ message: "Logged in successfully,here is your token", token })
                    } else {
                        return res.status(422).json({ error: "invalid email and password" })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })
})

router.post('/reset_password', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        const token = buffer.toString("hex");
        const data = JSON.parse(req.body.data)
        User.findOne({ email: data.email })
            .then(user => {
                if (!user) {
                    return res.status(422).json({ error: "user doesn't exist with that email" })
                }
                user.resetToken = token
                user.expireToken = Date.now() + 3600000
                user.save().then((result) => {
                    transporter.sendMail({
                        to: user.email,
                        from: "amrik@techindustan.com",
                        subject: "password reset",
                        html: `
                <p>You requersted for password reset</p>
                <h5>Click on this <a href="http://localhost:3000/reset/${token}">link to reset password</a></h5>
                `
                    })
                    res.json({ message: "Check your email" })

                })
            })
    })
})
router.post('/new-password', (req, res) => {
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.status(422).json({ error: "try again session expired" })

            }
            bcrypt.hash(newPassword, 12).then(hashedpassword => {
                user.password = hashedpassword
                user.resetToken = undefined
                user.expireToken = undefined
                user.save().then((savedUser) => {
                    res.json({ message: "password updated success" })
                })
            })
        })
        .catch(err => {
            console.log(err)
        })
})



module.exports = router