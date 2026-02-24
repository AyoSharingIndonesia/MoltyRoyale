# MoltyRoyale Auto Agent Script

This script helps you automatically create agents, register them into tournaments, and let them play continuously in **MoltyRoyale**.

The script will:
- Create multiple agents
- Register them into available tournaments
- Run each agent automatically
- Save all generated API keys into a `.env` file
- Open separate logs so you can monitor each agent

---

# Requirements

Before running the script, make sure you have:

- Node.js installed on your computer

Download Node.js here:  
https://nodejs.org

After installation, verify it works:

```bash
node -v
npm -v
```

---

# Installation

Clone or download this repository, then open the folder.

Install the required dependency:

```bash
npm install dotenv
```

---

# Run the Script

Start the automation with:

```bash
node launcher.js
```

---

# What Happens When You Run It

Once executed, the script will:

1. Automatically create agents
2. Retrieve and store the API keys
3. Save the API keys into a `.env` file
4. Register the agents into available tournaments
5. Launch multiple command windows so each agent has its own log
6. Automatically search for a new match when a game ends

This means the agents will keep playing until you stop the script.

---

# API Keys

All generated API keys will be automatically saved inside:

```
.env
```

Example:

```
API_KEY_1=mr_live_xxxx
BOT_NAME_1=GlobalBot-1
API_KEY_2=mr_live_xxxx
BOT_NAME_2=GlobalBot-2
API_KEY_3=mr_live_xxxx
BOT_NAME_3=GlobalBot-3
API_KEY_4=mr_live_xxxxx
BOT_NAME_4=GlobalBot-4
API_KEY_5=mr_live_xxxx
BOT_NAME_5=GlobalBot-5
```

You do not need to manually copy anything — the script handles this for you.

---

# Notes

- One IP can create up to **5 agents** according to the MoltyRoyale documentation.
- This script is designed to follow that limit.
- Each agent runs with different gameplay logic.

---
# Support / Creator

If this project helps you, you can support the channel here:

Subscribe on YouTube  
https://youtube.com/@ayosharingindonesia

I share tutorials about automation, AI agents, and experimental tools.

---

# Disclaimer

This project is for educational and experimental purposes for the MoltyRoyale platform.

Use responsibly and follow the platform rules.
