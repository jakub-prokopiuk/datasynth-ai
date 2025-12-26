# DataSynth.ai

**DataSynth.ai** is a powerful, full-stack application designed to generate complex, relational synthetic datasets using a combination of standard algorithms (Faker) and Large Language Models.

It solves the problem of creating realistic test data that requires context-awareness, creativity, and relational integrity across multiple tables.


## Installation & Setup

### Running with Docker
1. Clone the Repository
```bash
git clone https://github.com/jakub-prokopiuk/datasynth-ai.git
cd datasynth-ai
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory and add your OpenAI API key:
```bash
touch ./backend/.env
echo "OPENAI_API_KEY=your-api-key-here" > ./backend/.env
```

### 3. Build and Run with Docker Compose
```bash
docker compose up --build
```

## Usage

1. Defining tables
- Use the Table Manager to create tables (e.g., users, orders) and set the number of rows for each.

2. Building schema
- Add fields to each table and choose a field type:

    - Faker  
        For standard values (UUID, email, name, address).

    - AI / LLM  
        For creative content. Use a prompt template to describe the desired output.

        Example prompt template:
        ```
        Write a short review for a product named {product_name}.
        ```
        Tip: Use `{field_name}` to reference other fields in the same row.

    - Distribution  
        Select a set of possible values with optional weights (e.g., Status: Active (80%), Inactive (20%)).

    - Relation (FK)  
        Link a column to a primary key in another table. The engine ensures parent tables are generated first to satisfy foreign keys.

3. Generation
- Click "Run Generation". The backend processes tables in dependency order to honor FK constraints.

4. Export
- After generation, inspect results and export as:
    - JSON
    - CSV (downloaded as a ZIP)
    - SQL (INSERT statements)

5. Import / Save schema
- The application supports saving and loading schema definitions as JSON files for reuse.
- After creating a schema, click "Save" to download the JSON file.
- To load a schema, use the "Import" button and select a previously saved JSON file.