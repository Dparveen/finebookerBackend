module.exports = {
  apps: [
    {
      name: 'Blacklist By Parveen Saini',
      script: 'index.js', // --------------- our node start script here like index.js

      // ------------------------------------ watch options - begin
     watch: ["middleware", "models", "routes","views"],
	  // Specify delay between watch interval
	  watch_delay: 1000,
	  // Specify which folder to ignore 
	  ignore_watch : ["public","nde_modules"],
      watch_options: {
        followSymlinks: false,
      },
      // ------------------------------------ watch options - end

//       env: {
//         NODE_ENV: 'development',
//         PORT: 3001,
//         DEBUG: 'api:*',
//         MONGODB_URI:
//           'mongodb://localhost:27017/collection1?readPreference=primary&ssl=false',
//       },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
        // user: "SSH_USERNAME",
        // host: "SSH_HOSTMACHINE",
    },
  },
}