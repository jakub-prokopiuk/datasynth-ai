import asyncio
from celery_worker import celery_app
from engine import DataEngine
from models import GeneratorRequest
from job_manager import job_manager
import json

@celery_app.task(bind=True, name="generate_dataset_task")
def generate_dataset_task(self, job_id: str, request_json: str):
    try:
        req_dict = json.loads(request_json)
        request = GeneratorRequest(**req_dict)
        
        engine = DataEngine()
        
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        result = loop.run_until_complete(engine.generate(request, job_id))
        
        job_manager.complete_job(job_id, result)
        
        return {"status": "success", "job_id": job_id}

    except Exception as e:
        print(f"CRITICAL WORKER ERROR: {e}")
        job_manager.fail_job(job_id, str(e))
        raise e