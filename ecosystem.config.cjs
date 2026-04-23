module.exports = {
    apps: [
        {
            name: 'optracks:3002',
            script: 'npm',
            args: 'run dev -- --port 3002',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'development',
                PORT: 3002
            }
        }
    ]
};