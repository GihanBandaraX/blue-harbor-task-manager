# Taskora — Full-Stack Task Management

Taskora is a production-ready, full-stack task management application built with a **NestJS** backend (Prisma ORM + SQLite) and a **Next.js 16** frontend (Tailwind CSS + Shadcn UI). It provides a clean, responsive dashboard for organizing tasks, tracking due dates, filtering by status, and managing workflows seamlessly.

---

## 🛠️ Tech Stack

* **Backend (`/api`)**: NestJS, Prisma ORM, SQLite, class-validator, class-transformer.
* **Frontend (`/web`)**: Next.js 16 (App Router), React, Tailwind CSS, Shadcn UI, Lucide Icons, Sonner.
* **Containerization**: Docker & Docker Compose.

---

## 📁 Project Structure

```text
task-manager/
├── api/                   # NestJS Backend Application
│   ├── prisma/            # Prisma schema and SQLite database
│   ├── src/               # Controllers, modules, services, DTOs
│   └── ...
├── web/                   # Next.js Frontend Application
│   ├── src/               # App router pages, components, UI layout
│   └── ...
├── docker-compose.yml     # Multi-container orchestration setup
└── README.md
