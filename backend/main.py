from fastapi import FastAPI, HTTPException, Response
from models import GeneratorRequest
from engine import DataEngine
from exporters import DataExporter
import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="LLM Data Generator API",
    description="Relational Data Generator API",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_engine = DataEngine()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Relational Generator API is running"}

@app.post("/generate")
def generate_data(request: GeneratorRequest):
    print(f"Received job: {request.config.job_name} with {len(request.tables)} tables.")
    
    try:
        generated_data = data_engine.generate(request)
        
        format_type = request.config.output_format.lower()
        
        if format_type == "json":
            total_rows = sum(len(rows) for rows in generated_data.values())
            return {
                "status": "success",
                "job_name": request.config.job_name,
                "tables_count": len(generated_data),
                "total_rows": total_rows,
                "data": generated_data 
            }
            
        elif format_type == "csv":
            zip_content = DataExporter.to_csv_zip(generated_data)
            return Response(
                content=zip_content,
                media_type="application/zip",
                headers={"Content-Disposition": f"attachment; filename={request.config.job_name}.zip"}
            )
            
        elif format_type == "sql":
            file_name = request.config.job_name.replace(" ", "_").lower()
            sql_content = DataExporter.to_sql(generated_data)
            return Response(
                content=sql_content,
                media_type="application/sql",
                headers={"Content-Disposition": f"attachment; filename={file_name}.sql"}
            )
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported output format")

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)