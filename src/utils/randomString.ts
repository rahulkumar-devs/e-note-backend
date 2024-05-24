import  crypto  from 'crypto';



function generateRandomPassword(length:number) {
  // Define the characters to be used in the password
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  const charactersLength = characters.length;
  
  // Generate a random password
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charactersLength);
    password += characters[randomIndex];
  }
  
  return password;
}

export default generateRandomPassword;
