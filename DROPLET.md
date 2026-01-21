# Running Chore Manager on a DigitalOcean Droplet

This guide covers deploying and running the Chore Manager app on a DigitalOcean droplet.

## Prerequisites

- A DigitalOcean droplet (Ubuntu 22.04 or newer recommended)
- SSH access to the droplet
- The codebase uploaded to the droplet (e.g., at `/home/ryanpbrown/chore`)

## Step 1: Install Node.js

If Node.js isn't installed, install it using NodeSource:

```bash
# Update package list
sudo apt update

# Install curl if needed
sudo apt install -y curl

# Add NodeSource repository (Node.js 20.x LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

## Step 2: Install Build Dependencies

The `better-sqlite3` package requires build tools:

```bash
sudo apt install -y build-essential python3
```

## Step 3: Set Up the Backend

```bash
cd /home/ryanpbrown/chore/backend

# Install dependencies
npm install

# Create .env file if it doesn't exist
cp .env.example .env

# Edit the .env file
nano .env
```

**Required `.env` configuration:**

```env
PORT=3000
JWT_SECRET=your-secure-random-string-here
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Run the database migration:**

```bash
npm run migrate
```

## Step 4: Build the Frontend

```bash
cd /home/ryanpbrown/chore/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with the production build.

## Step 5: Configure Backend to Serve Frontend

Modify the backend to serve the frontend static files. Add this to `/home/ryanpbrown/chore/backend/src/server.js`:

```javascript
// Add this after other middleware, before the error handler
// Serve frontend static files
app.use(express.static(join(__dirname, '../../frontend/dist')));

// Catch-all route - serve index.html for client-side routing
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(join(__dirname, '../../frontend/dist/index.html'));
});
```

## Step 6: Install PM2 for Process Management

PM2 keeps your app running and restarts it if it crashes:

```bash
sudo npm install -g pm2
```

## Step 7: Start the Application with PM2

```bash
cd /home/ryanpbrown/chore/backend

# Start the app
pm2 start src/server.js --name "chore-manager"

# Save the process list so it survives reboot
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs
```

**Useful PM2 commands:**

```bash
pm2 status              # Check app status
pm2 logs chore-manager  # View logs
pm2 restart chore-manager  # Restart the app
pm2 stop chore-manager     # Stop the app
pm2 delete chore-manager   # Remove from PM2
```

## Step 8: Set Up Nginx (Recommended)

Nginx provides better performance and allows running on port 80/443:

```bash
sudo apt install -y nginx
```

Create an Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/chore-manager
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-droplet-ip-or-domain;

    # Increase max upload size for photo uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/chore-manager /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 9: Configure Firewall

Allow HTTP/HTTPS traffic:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Step 10: Add SSL with Let's Encrypt (Optional but Recommended)

If you have a domain name pointing to your droplet:

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d yourdomain.com
```

Certbot will automatically configure Nginx for HTTPS.

## Quick Start (Without Nginx)

For quick testing without Nginx, you can access the app directly on port 3000:

```bash
# Make sure port 3000 is open
sudo ufw allow 3000

# Access at http://your-droplet-ip:3000
```

## Troubleshooting

### Check if the app is running

```bash
pm2 status
pm2 logs chore-manager --lines 50
```

### Check what's listening on port 3000

```bash
sudo lsof -i :3000
```

### Database issues

```bash
cd /home/ryanpbrown/chore/backend
rm chore.db chore.db-shm chore.db-wal 2>/dev/null
npm run migrate
pm2 restart chore-manager
```

### Nginx issues

```bash
sudo nginx -t                    # Test config
sudo systemctl status nginx      # Check status
sudo tail -f /var/log/nginx/error.log  # View errors
```

### Permission issues

```bash
# Make sure the uploads directory exists and is writable
mkdir -p /home/ryanpbrown/chore/backend/uploads
chmod 755 /home/ryanpbrown/chore/backend/uploads
```

## Updating the Application

When you push new code to the droplet:

```bash
cd /home/ryanpbrown/chore

# Pull changes (if using git)
git pull

# Reinstall dependencies if needed
cd backend && npm install
cd ../frontend && npm install

# Rebuild frontend
cd frontend && npm run build

# Restart the backend
pm2 restart chore-manager
```

## Accessing the App

Once everything is set up:

- **With Nginx**: `http://your-droplet-ip` or `https://yourdomain.com`
- **Without Nginx**: `http://your-droplet-ip:3000`

1. Register a new account and create a group
2. Share the invite code with your housemates
3. Start managing chores!
