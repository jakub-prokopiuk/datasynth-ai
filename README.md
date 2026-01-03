# DataSynth.io

**DataSynth.io** is a powerful, full-stack application designed to generate complex, relational synthetic datasets using a combination of standard algorithms (Faker) and Large Language Models.

It solves the problem of creating realistic test data that requires context-awareness, creativity, and relational integrity across multiple tables.

## Key Features

* **Microservices Architecture:** Scalable design using **FastAPI** (Backend), **React** (Frontend), **Celery** (Worker), and **Redis** (Broker).
* **Dual LLM Support:**
    * **Cloud:** Integrated OpenAI support (GPT-4o, GPT-3.5).
    * **Local (Privacy-First):** Full offline support using **Ollama** (Llama 3, Mistral, Phi-3).
* **Async Processing:** Handles massive datasets efficiently using background task queues.
* **Direct Database Push:** Push generated data directly to **PostgreSQL, MySQL, MSSQL, or Oracle**.
* **Relational Integrity:** Automatically resolves Foreign Key dependencies and generates data in the correct topological order.
* **Project Management:** Save and load schemas to the internal database ("Cloud Save").
* **Secure:** JWT Authentication and protected API endpoints.

## Installation & Setup

### Running with Docker
1. Clone the Repository
```bash
git clone https://github.com/jakub-prokopiuk/datasynth-ai.git
cd datasynth-ai
```

### 2. Environment Variables
Create an `.env` file in the `backend` directory:
```bash
touch ./backend/.env
```
Add your OpenAI API key (if using cloud LLMs):
```
echo "OPENAI_API_KEY=your-api-key-here" > ./backend/.env
```

### 3. Build and Run with Docker Compose
```bash
docker compose up --build
```

### 4. Setup Local LLMs (Optional)
If you plan to use local models via Ollama, you need to pull a model once the container is running:
```bash
docker exec -it datasynth-ollama ollama pull llama3
```
(You can replace llama3 with mistral, phi3, etc.)

## Usage

1. Authentication
Access the application at `http://localhost:5173`. Log in with default credentials:

- Username: `admin`
- Password: `admin`


2. Defining Schema

    - Table Manager: Create tables (e.g., users, orders) and set row counts.

    - Field Builder: Add fields using various generators:

        - **Faker**: Standard data (UUID, Name, Address, Date).

        - **AI / LLM**: Creative content. Choose between OpenAI or Ollama.

            Prompt Example: "Write a polite decline email for order {order_id}."

        - **Relation (FK)**: Link to a primary key in another table.

        - **Distribution**: Weighted random values (e.g., "Premium": 20%, "Standard": 80%).

        - **Number**: Fixed or ranged numeric values.

        - **Boolean**: True/False values and their probabilities.

        - **Timestamp**: Date and time values within a specified range.

        - **Regex Pattern**: Generate strings matching a regex.

        - **Derived / Logic**: Values based on other fields using templates.

3. Generation
- Click "Run Generation".

- The task is queued in Redis and processed by the Celery Worker.

- Progress is streamed in real-time via WebSockets.

4. Export
Once generation is complete, you can:

    - Download: JSON file or CSV (Zipped).

    - Push to DB: Insert data directly into an external database in one of the following formats.

            postgresql://user:pass@host:5432/db

            mysql+pymysql://user:pass@host:3306/db

            mssql+pymssql://user:pass@host:1433/db

            oracle+oracledb://user:pass@host:1521/service

5. Import / Save schema
- The application supports saving and loading schema definitions as JSON files for reuse.
- After creating a schema, click "Save" to download the JSON file.
- To load a schema, use the "Import" button and select a previously saved JSON file.