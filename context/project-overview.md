# Ghost AI

## Overview

Ghost AI is a real-time collaborative system design workspace, where users describe a system in natural language, an AI agent maps that system on the shared canvas, collaborators refine the architecture, and the app generates a technical specification from the resulting graph.

## Goals

1. Let authenticated users create and manage architecture projects.
2. Provide a collaborative real-time canvas for system design.
3. Let users import prebuilt starter system design templates into the canvas.
4. Let AI generate an initial architecture from a natural language prompt.
5. Let collaborators refine the generated architecture.
6. Convert the final graph into a professional technical specification document.

## Core User Flow

1. User signs in.
2. User creates or selects a project.
3. User enters the project workspace.
4. User prompts imports a starter system design template into the canvas.
5. User prompts the AI to generate or extend the system design.
6. AI generates nodes and edges in the shared canvas.
7. User triggers spec generation.
8. App persists the generated Markdown specification.
9. User reviews or downloads the specification.

## Features

Authentication and project management

- User sign-in and route protection.
- Project creation, ownership, and collaborator access.
- Project list and workspace navigation.

Collaborative canvas

- Shared real-time canvas using Liveblocks and React Flow.
- Live cursors, presence indicators, and node/edge editing.
- Canvas snapshots persisted to the file system.

Starter system design templates

- A curated library of prebuilt system design templates.
- Users can import a starter template into the canvas at any point during editing.
- Templates are static canvas snapshots loaded directly into the active room.
- Covers common patterns: monolith, microservices, event-driven, serverless, and more.

AI architecture generation

- The AI generates a system design from a user-supplied prompt.
- The output is structured as canvas nodes and edges written into the shared room.
- Generation runs as a durable background task.

Spec generation

- The current canvas graph is converted into a Markdown technical specification.
- Specs are persisted as files and linked to the project in the database.
- Users can review or download the generated specification.

Scope
In scope
- Authentication and route protection
- Project creation, ownership, and collaborator access
- Starter system design template library and import
- Real-time shared canvas with nodes, edges, and presence
- AI-powered architecture generation from prompts
- AI-powered Markdown spec generation from the canvas graph
- Persistent storage for project metadata and generated artifacts
- Spec download

Out of scope
- Billing and subscription systems
- Enterprise permission tiers beyond owner and collaborator
- Versioned spec history and review workflows
- Production object storage migration
- Mobile-native applications

Success Criteria
- A signed-in user can create and open a project.
- Multiple users can collaborate in the same canvas simultaneously.
- A user can import a prebuilt starter design into the canvas.
- AI can generate an architecture into the shared room from a prompt.
- The graph can be converted into a persisted Markdown spec.
- Project metadata and generated artifacts are stored in the correct layers.