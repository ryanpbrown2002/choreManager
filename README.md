# Chore Manager

A web app for managing shared chores within a group. An admin can create chores, invite members, and automatically generate a rotating schedule. Users receive email notifications when assigned new chores and can mark tasks complete with photo verification.

Built for small groups (houses, dorms, co-ops) who need a simple way to keep track of who's doing what and when.

## Features

- **Group Management** - Create a group and invite members with a simple invite code
- **Chore Rotation** - Automatically rotate chore assignments weekly
- **Photo Verification** - Require photo proof of completed chores
- **Email Notifications** - Get notified when new chores are assigned
- **Completion Stats** - Track completion rates by member or chore
- **Dark Mode** - Toggle between light and dark themes
- **Mobile Friendly** - Responsive design works on any device

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Auth**: JWT

## Project Structure

```
choreManager/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── api/
│   └── ...
├── backend/           # Node + Express
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── db/
│   └── uploads/
└── shared/
```

## Open Source

This project is open source. Feel free to fork, contribute, or use it for your own group.

Created by [Ryan Brown](https://github.com/ryanpbrown2002)
