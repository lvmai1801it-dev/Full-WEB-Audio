# PROJECT BLUEPRINT: HIGH-PERFORMANCE AUDIO PLATFORM (XEON EDITION)

**Target Hardware:** Dual Xeon E5-2670 (32 Threads), 16GB RAM, SSD, Ubuntu.
**Architecture:** Polyglot Microservices (Hybrid).
- **Database:** PostgreSQL (Shared Source of Truth).
- **Backend API:** NodeJS + Express + Prisma (User interaction, fast I/O).
- **Worker/Crawler:** .NET 8 Console App (High concurrency data processing).
- **Frontend:** ReactJS + Vite + TailwindCSS.

---

## PART 1: DATABASE SCHEMA (POSTGRESQL)
*Instructions: Copy this SQL script first. It acts as the contract between NodeJS and .NET.*

**Key Features:**
- **UUIDs:** For scalability and security.
- **Many-to-Many:** Authors/Genres are normalized.
- **User State:** Tracks exact playback position (seconds) for "Resume" functionality.
- **Queue System:** Decouples the API from the heavy crawling process.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES (Authors & Genres)
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BOOKS
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    source_url TEXT NOT NULL, -- Original URL for reference
    total_chapters INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. JUNCTION TABLES (Many-to-Many)
CREATE TABLE book_authors (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE book_genres (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);

-- 4. CHAPTERS
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    chapter_index INT NOT NULL,
    audio_url TEXT NOT NULL, -- Direct Link extracted from Internet Archive
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_chapters_book_index ON chapters(book_id, chapter_index);

-- 5. USER PLAYBACK STATE (Smart Resume)
CREATE TABLE user_book_state (
    user_id UUID NOT NULL, -- Will link to Users table later
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    current_chapter_id UUID NOT NULL REFERENCES chapters(id),
    position_seconds INT DEFAULT 0, -- Exact second where user stopped
    is_completed BOOLEAN DEFAULT FALSE,
    last_listened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, book_id)
);
CREATE INDEX idx_user_state_recent ON user_book_state(user_id, last_listened_at DESC);

-- 6. CRAWL QUEUE (Bridge between Node & .NET)
CREATE TABLE crawl_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    attempt_count INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
PART 2: IMPLEMENTATION PROMPTS (EXECUTE IN ORDER)
STAGE 1: BACKEND API (NODEJS + PRISMA)
Goal: Create the API Server that manages user requests and data serving.

Prompt: "Act as a Senior Backend Developer. I want to build a Commercial-grade Audio Streaming API using NodeJS, Express, and Prisma ORM with PostgreSQL.

Task 1: Setup & Schema

Initialize a TypeScript project.

Take the SQL Schema provided above and translate it into a schema.prisma file. Ensure all Many-to-Many relations and UUIDs are correctly defined.

Task 2: API Endpoints Implement the following RESTful APIs:

POST /api/crawl: Accept { url }. Insert a new record into crawl_queue with status 'pending'.

GET /api/books: List books with pagination. Include Authors and Genres in the response using Prisma include.

GET /api/books/:id: Get book details.

Smart Resume Logic: If a userId query param is provided, perform a query to user_book_state to return the user's current progress (current_chapter_id, position_seconds) for this book.

POST /api/progress: Accept { userId, bookId, chapterId, positionSeconds }.

Logic: Upsert (Update if exists, Insert if new) into user_book_state. Update last_listened_at to NOW()."

STAGE 2: HIGH-PERFORMANCE WORKER (.NET 8)
Goal: Create the Crawler that utilizes the Dual Xeon CPU to process data.

Prompt: "Act as a Senior .NET Performance Engineer. Build a Console Application (Worker) using .NET 8 to process the crawl queue.

Task 1: Database Connection

Use Entity Framework Core (EF Core) (Database First or Code First matching the SQL schema).

Generate Entities (POCO classes) that match the PostgreSQL tables exactly.

Task 2: The Polling Loop

Implement a BackgroundService that polls the crawl_queue table for 'pending' items every 5 seconds.

When a URL is found, change status to 'processing' immediately.

Task 3: The Crawler Logic (Concurrency Optimization)

Use HtmlAgilityPack to parse HTML.

Find-or-Create Logic: When scraping Author or Genre strings:

Check DB if they exist (by slug).

If Yes -> Get existing ID.

If No -> Insert new record -> Get new ID.

Parallel Processing: Since I have a Dual Xeon (32 Threads) server, use Parallel.ForEachAsync with MaxDegreeOfParallelism = 20 to process the list of chapters.

Action: Visit each chapter page, extract the Direct MP3 Link (usually from archive.org source tags). DO NOT download the file, just extract the URL.

Transaction: Save the Book, Chapters, and Relations (BookAuthors) in a single Database Transaction (BeginTransaction).

Finalize: Update queue status to 'completed' or 'failed'."

STAGE 3: FRONTEND (REACT + VITE)
Goal: Modern UI with a Persistent Audio Player.

Prompt: "Act as a Senior Frontend Developer. Build the UI using ReactJS (Vite + TypeScript) and TailwindCSS.

Task 1: Setup & State

Install: axios, @tanstack/react-query, zustand (State Management), lucide-react.

Create a usePlayerStore (Zustand) with state: isPlaying, currentTrack (url, title, bookImage), playlist (array of chapters), currentIndex, currentTime.

Task 2: Components

StickyPlayer: A fixed footer component (always visible).

Use HTML5 <audio>.

Auto-Next: On onEnded event, play the next track in the playlist.

Auto-Sync: Use useDebounce to call POST /api/progress every 10 seconds to save position to DB.

Local Persistence: Save state to localStorage for page reloads.

BookDetail: Show list of chapters.

Resume Button: If the API returns progress data, show a 'Resume Playing' button that loads the specific chapter and seeks to the specific second.

CrawlInput: A simple admin input to POST to /api/crawl."

PART 3: DEPLOYMENT GUIDE (UBUNTU)
1. Nginx Config (Reverse Proxy)
File: /etc/nginx/sites-available/audio-platform

Nginx

server {
    listen 80;
    server_name your_server_ip;

    # Frontend
    location / {
        root /var/www/audio-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
2. Systemd Service for .NET Worker
File: /etc/systemd/system/crawler.service

Ini, TOML

[Unit]
Description=Audio Crawler .NET Worker
After=network.target postgresql.service

[Service]
WorkingDirectory=/path/to/dotnet/publish
ExecStart=/usr/bin/dotnet CrawlerWorker.dll
Restart=always
User=root

[Install]
WantedBy=multi-user.target