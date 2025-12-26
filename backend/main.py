from fastapi import FastAPI, HTTPException, Response, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from models import GeneratorRequest, ProjectCreate, ProjectSummary
from engine import DataEngine
from exporters import DataExporter
import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Union, Any
import asyncio
from database import init_db, get_db, ProjectDB
from job_manager import job_manager

load_dotenv()

try:
    init_db()
except Exception as e:
    print(f"Warning: DB connection failed on startup. Ensure DB is running. Error: {e}")

app = FastAPI(
    title="LLM Data Generator API",
    description="Relational Data Generator API",
    version="0.4.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_engine = DataEngine()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Relational Generator API is running"}

def format_generation_output(data: dict, config) -> Any:
    format_type = config.output_format.lower()
    
    if format_type == "json":
        total_rows = sum(len(rows) for rows in data.values())
        return {
            "status": "success",
            "job_name": config.job_name,
            "tables_count": len(data),
            "total_rows": total_rows,
            "data": data 
        }
    elif format_type == "csv":
        return DataExporter.to_csv_zip(data)
    elif format_type == "sql":
        return DataExporter.to_sql(data)
    else:
        raise ValueError("Unsupported output format")

def create_file_response(content: Union[str, bytes], config) -> Response:
    format_type = config.output_format.lower()
    
    if format_type == "csv":
        return Response(
            content=content,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={config.job_name}.zip"}
        )
    elif format_type == "sql":
        file_name = config.job_name.replace(" ", "_").lower()
        return Response(
            content=content,
            media_type="application/sql",
            headers={"Content-Disposition": f"attachment; filename={file_name}.sql"}
        )
    return content

@app.post("/generate")
async def generate_data(request: GeneratorRequest):
    print(f"Received sync job: {request.config.job_name}")
    try:
        raw_data = await data_engine.generate(request)
        formatted_output = format_generation_output(raw_data, request.config)
        
        if request.config.output_format.lower() == "json":
            return formatted_output
        else:
            return create_file_response(formatted_output, request.config)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

async def run_generation_task(job_id: str, request: GeneratorRequest):
    try:
        raw_data = await data_engine.generate(request, job_id)
        
        formatted_output = format_generation_output(raw_data, request.config)
        
        job_manager.complete_job(job_id, formatted_output)
        
    except asyncio.CancelledError:
        print(f"Job {job_id} cancelled.")
        job_manager.cancel_job(job_id)
    except Exception as e:
        print(f"Job {job_id} failed: {e}")
        import traceback
        traceback.print_exc()
        job_manager.fail_job(job_id, str(e))

@app.post("/generate/async")
async def start_generation_job(request: GeneratorRequest, background_tasks: BackgroundTasks):
    job_id = job_manager.create_job()
    background_tasks.add_task(run_generation_task, job_id, request)
    return {"job_id": job_id, "status": "started"}

@app.delete("/jobs/{job_id}")
async def cancel_job(job_id: str):
    job_manager.cancel_job(job_id)
    return {"status": "cancellation_requested"}

@app.websocket("/ws/jobs/{job_id}")
async def websocket_job_status(websocket: WebSocket, job_id: str):
    await websocket.accept()
    try:
        while True:
            job = job_manager.get_job(job_id)
            if not job:
                await websocket.send_json({"status": "error", "message": "Job not found"})
                break
            
            response = {
                "status": job["status"],
                "progress": job["progress"],
                "total": job["total"]
            }
            
            if job["status"] in ["failed", "cancelled"]:
                response["error"] = job.get("error")
                await websocket.send_json(response)
                await websocket.close()
                break

            if job["status"] == "completed":
                await websocket.send_json(response)
                await websocket.close()
                break

            await websocket.send_json(response)
            await asyncio.sleep(0.05)
            
    except WebSocketDisconnect:
        print(f"Client disconnected from job {job_id}")

@app.get("/jobs/{job_id}/result")
def get_job_result(job_id: str):
    job = job_manager.get_job(job_id)
    if not job or job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not ready or failed")
    
    result = job["data"]
    
    if isinstance(result, (bytes, str)) and not isinstance(result, dict):
        media_type = "application/zip" if isinstance(result, bytes) else "application/sql"
        return Response(content=result, media_type=media_type)
    else:
        return result

@app.post("/projects", response_model=ProjectSummary)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    schema_json = project.schema_data.model_dump()
    db_project = ProjectDB(name=project.name, description=project.description, schema_data=schema_json)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=List[ProjectSummary])
def list_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ProjectDB).order_by(ProjectDB.updated_at.desc()).offset(skip).limit(limit).all()

@app.get("/projects/{project_id}", response_model=GeneratorRequest)
def get_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not db_project: raise HTTPException(status_code=404, detail="Project not found")
    return db_project.schema_data

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not db_project: raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"status": "success", "message": "Project deleted"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)