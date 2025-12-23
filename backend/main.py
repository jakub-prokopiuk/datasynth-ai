from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import JSONResponse
from models import GeneratorRequest
from engine import DataEngine
from exporters import DataExporter
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="LLM Data Generator API",
    description="Backend API for generating synthetic datasets using LLMs and other methods",
    version="0.1.0"
)

data_engine = DataEngine()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Generator API is running"}

@app.post("/generate")
def generate_data(request: GeneratorRequest):
    print(f"Received request: {request.config.job_name} [{request.config.output_format}]")
    
    try:
        generated_data = data_engine.generate(request)
        
        format_type = request.config.output_format.lower()
        
        if format_type == "json":
            return {
                "status": "success",
                "job_name": request.config.job_name,
                "rows_count": len(generated_data),
                "data": generated_data
            }
            
        elif format_type == "csv":
            csv_content = DataExporter.to_csv(generated_data)
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={request.config.job_name}.csv"}
            )
            
        elif format_type == "sql":
            table_name = request.config.job_name.replace(" ", "_").lower()
            sql_content = DataExporter.to_sql(generated_data, table_name)
            return Response(
                content=sql_content,
                media_type="application/sql",
                headers={"Content-Disposition": f"attachment; filename={table_name}.sql"}
            )
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported output format")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)