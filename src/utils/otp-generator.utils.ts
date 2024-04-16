import crypto from "crypto"

const generateOTP = ()=>{
    const length = 6
    const characters = '0123456789'

    let otp = ''
    for (let o=0; o<length; o++) {
        const getRandomIndex = Math.floor(Math.random() * characters.length)
        otp += characters[getRandomIndex]
    }

    return otp
}
export default generateOTP;


// Generate verification token
export function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
  }