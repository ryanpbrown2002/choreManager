# Chore Manager

A vibe-coded web app for managing shared chores within a group. 
An admin can create chores, invite members, and automatically generate a rotating schedule for the semester. 
Users receive email notifications when assigned new chores and can mark tasks complete with photo verification.
Built for small groups (houses, dorms, co-ops) who need a simple way to keep track of who's doing what and when.


## Project Structure
```
chore/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── api/       # API client functions
│   └── ...
├── backend/           # Node + Express
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/  # email, rotation logic cleanup
│   │   ├── middleware/# auth
│   │   └── db/        # SQLite setup, migrations
│   └── uploads/       # Temporary photo storage
└── shared/            # Types/constants used by both
```
