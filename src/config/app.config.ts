
export default () => ({
  
  database: {
    url: process.env.DATABASE_URL,
  },

  security: {
    salt: 10,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY,
  },

  baseUrl:{
    url: process.env.BASE_URL
  }

});
