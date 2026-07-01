# NetSage AI

NetSage AI is a futuristic, offline-first network intelligence dashboard designed to represent a secure operations center for mission-critical infrastructure. The project combines real-time monitoring, predictive analytics, incident management, and AI-assisted decision support in a single polished web interface.

## Project Summary

NetSage AI is a front-end prototype that simulates how a modern network command center could help engineers monitor infrastructure health, detect emerging issues, and respond to incidents before they escalate. It is tailored for high-availability environments such as satellite communications, defense systems, research networks, and other mission-critical operations where reliability and situational awareness are essential.

The experience is built around a dark, glassmorphism-inspired UI and includes multiple interactive views for:

- Live network health monitoring
- Device and topology visualization
- Predictive failure analysis
- Incident tracking and response workflows
- Telemetry-based analytics
- Offline AI assistant interactions
- Secure, air-gapped operational design

## Key Features

### 1. Mission Control Dashboard
The main dashboard highlights key operational KPIs such as active devices, network health, active alerts, latency, uptime, and AI-generated warnings. It also displays live charts and a network topology heat map for quick visibility into system status.

### 2. Interactive Network Topology
Users can explore an animated network map that visualizes connected infrastructure nodes and their health levels. The topology view includes color-coded status indicators for healthy, warning, and critical devices.

### 3. Predictive Analytics
The project includes a prediction center that simulates AI-based failure forecasting. It presents probable issues, confidence levels, and time-to-failure estimates to help operators anticipate outages or degradations.

### 4. Incident Management
NetSage AI features a structured incident view for tracking issues by severity, reviewing summaries, and analyzing incident trends. This helps model how operators could triage problems and monitor resolution performance.

### 5. Offline-First AI Assistant
The AI assistant section provides an offline-style conversational experience with sample prompts, suggested queries, and local knowledge-base topics. It is designed to feel like an intelligent support layer for network operations without depending on external services.

### 6. Device Risk and Telemetry Views
The application also includes dedicated views for device risk assessment, telemetry analysis, and operational metrics, giving a more detailed look into performance and reliability across the network.

## Technology Stack

- HTML5 for application structure
- CSS3 for the visual design and responsive layout
- JavaScript for interactivity and rendering
- Chart.js for charts and telemetry visualization
- No backend required; the project runs entirely in the browser

## Project Structure

- index.html — main HTML structure and page views
- styles.css — complete styling system, layout, cards, charts, and dark theme
- app.js — application logic, router, mock data, charts, topology animation, and UI interactions
- PPT.pptx — presentation material related to the project

## How to Run

You can run the project locally by opening index.html in a browser.

For a local development server, use:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Intended Use

NetSage AI is intended as a product-style prototype for showcasing how AI-assisted observability and predictive maintenance could support secure and resilient network operations. It is ideal for demonstrations, presentations, hackathons, and UI/UX exploration for infrastructure monitoring platforms.
