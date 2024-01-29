import process from 'process'

const config = {
  apiBaseUrl: 'https://bodzify.com/api/v1/',
  username: process.env.BODZIFY_API_UMG_USERNAME,
  password: process.env.BODZIFY_API_UMG_USER_PASSWORD,
}
  
export default config
